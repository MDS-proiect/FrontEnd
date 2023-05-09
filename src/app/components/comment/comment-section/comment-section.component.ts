import { Component, Input } from '@angular/core';
import { Comment, CommentShow } from '../../../models/comment.model';
import { CommentService } from 'app/core/services/comment.service';
import { ProfileService } from 'app/core/services/profile.service';
import { GenericResponse } from 'app/models/generic-response.model';
import { Profile } from 'app/models/profile.model';

@Component({
  selector: 'mds-comment-section',
  templateUrl: './comment-section.component.html',
  styleUrls: ['./comment-section.component.scss']
})
export class CommentSectionComponent {

  // used to remember which comment we reply to
  // to know where to display reply component
  repliedParent: string | undefined;
  @Input() postId: string | undefined;
  rootComments: Partial<CommentShow>[] | undefined;
  childComments: {
    [key: string]: Partial<CommentShow>[]
  } = {};
  showReplies: {
    [key: string]: boolean
  } = {};

  constructor(private commentService: CommentService, private profileService: ProfileService) {

  }

  ngOnInit() {
    console.log(this.postId);
    // loading metadata
    this.commentService.getPostReplies(this.postId!)
      .subscribe((res: GenericResponse<Partial<Comment>[]>) => {
        if (res.error) {
          console.log(res.error);
        } else {
          this.rootComments = [];
          res.content.forEach(x => {
            this.rootComments?.push({
              metadata: x,
            });
            this.showReplies[x.id!] = false;
          });

          this.rootComments.forEach(comm => {
            // need this to display author's user name
            this.profileService.getProfile(comm.metadata!.userId!)
              .subscribe((y: GenericResponse<Partial<Profile>>) => {
                if (y.error) {
                  console.log(y.error);
                } else {
                  comm.author = y.content;
                }
              });
          });
        }
      });


  }

  onShowRepliesClick(id: string) {

    if (!this.showReplies[id]) {

      this.commentService.getCommentReplies(id)
        .subscribe((res: GenericResponse<Partial<Comment>[]>) => {
          if (res.error) {
            console.log(res.error);
          } else {
            this.childComments[id] = [];
            res.content.forEach(x => {
              this.childComments[id]?.push({
                metadata: x,
              });
            });

            this.childComments[id].forEach(comm => {
              // need this to display author's user name
              this.profileService.getProfile(comm.metadata!.userId!)
                .subscribe((y: GenericResponse<Partial<Profile>>) => {
                  if (y.error) {
                    console.log(y.error);
                  } else {
                    comm.author = y.content;
                  }
                });
            });
          }
        });
    }

    this.showReplies[id] = !this.showReplies[id];
  }

  onToggleReplyComponent(id: string) {
    this.repliedParent = this.repliedParent === id ? undefined : id;
  }

  isPostReply() {
    return this.repliedParent === "";
  }

  isCommentReply(id: string) {
    return this.repliedParent === id;
  }

}