import { Schema, Document, model } from "mongoose";
import { isEmail } from "validator";
import bcrypt from "bcrypt";
import crypto from "crypto";

export enum Role {
  USER = "user",
  GUIDE = "guide",
  LEAD = "lead-guide",
  MODERATOR = "moderator",
  ADMIN = "admin",
}

export interface IUser {
  name: string;
  email: string;
  photo: string;
  role: Role;
  password: string;
  passwordConfirm?: string;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends IUser, Document {
  checkPassword(password: string): Promise<boolean>;
  generatePasswordResetToken(): string;
  isJWTExpired(JWTTimestamp: number): boolean;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, "Please tell us your name!"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      validate: [isEmail, "Please provide a valid email"],
    },
    photo: {
      type: String,
      default: "default.jpg",
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.USER,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        // This only works on CREATE and SAVE!!!
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not the same!",
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
      },
    },
  },
);

// Query Middleware
userSchema.pre(/^find/, function (next) {
  // @ts-ignore
  this.find({ active: { $ne: false } });
  next();
});

// Document Middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.checkPassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.methods.isJWTExpired = function (JWTTimestamp: number) {
  if (this.passwordChangedAt) {
    return this.passwordChangedAt.getTime() / 1000 > JWTTimestamp;
  }
  return false;
};

const User = model<IUserDocument>("User", userSchema);

export default User;
