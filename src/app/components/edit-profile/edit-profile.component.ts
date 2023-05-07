import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, Validators } from "@angular/forms";
import { openClosedAnimation } from "app/animations";
import { CustomError, ErrorResponse } from "app/shared/utils/error";
import { Router } from '@angular/router';
import { ProfileService } from "app/core/services/profile.service";
import { catchError, map, of } from "rxjs";
import { ProfileCreate } from "app/models/profile-create.model";

@Component({
  selector: 'mds-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
  animations: [openClosedAnimation]
})
export class EditProfileComponent implements OnInit {
  constructor(private readonly fb: FormBuilder, private readonly profileService: ProfileService, public router: Router) {}

  public editProfileError: CustomError | undefined;

  public profilePicture?: File = undefined;

  public readonly profileForm = this.fb.group({
    username: ['', [Validators.minLength(5), Validators.maxLength(15)]],
    name: ['', [Validators.minLength(5), Validators.maxLength(15)]],
    bio: ['', Validators.maxLength(50)]
  });

  onSubmit(): void {
    if (this.profileForm.valid) {
      const data: ProfileCreate = {
        metadata: {
          username: this.username.value,
          name: this.name.value,
          bio: this.bio.value
        },
        media: this.profilePicture
      }

      this.profileService
        .patch(data)
        .pipe(
          map(() => true),
          catchError((err: ErrorResponse) => {
            this.editProfileError = err.error ? err.error.error : undefined
            return of(false);
          })
        )
        .subscribe((editProfileSuccessful) => editProfileSuccessful && this.router.navigateByUrl('/'));
    }
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length) {
      this.profilePicture = target.files[0];
    }
  }


  get username(): FormControl {
    return this .profileForm.get('username') as FormControl;
  }

  get name(): FormControl {
    return this.profileForm.get('name') as FormControl;
  }

  get bio(): FormControl {
    return this.profileForm.get('bio') as FormControl;
  }

  ngOnInit(): void {}
}
