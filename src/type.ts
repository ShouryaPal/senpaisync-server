export interface SignUpBody {
  email: string;
  password: string;
  name: string;
}

export interface SignInBody {
  email: string;
  password: string;
}

export interface UpdatePasswordBody {
  currentPassword: string;
  newPassword: string;
}
