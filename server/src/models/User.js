const mongoose = require('mongoose');

const providerLinkSchema = new mongoose.Schema(
  {
    enabled: {
      type: Boolean,
      default: false,
    },
    providerId: {
      type: String,
      trim: true,
    },
    username: {
      type: String,
      trim: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    linkedAt: {
      type: Date,
    },
  },
  { _id: false }
);

const passwordSchema = new mongoose.Schema(
  {
    hash: {
      type: String,
      select: false,
    },
    salt: {
      type: String,
      select: false,
    },
    updatedAt: {
      type: Date,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    password: {
      type: passwordSchema,
      default: () => ({}),
    },
    providers: {
      password: {
        type: providerLinkSchema,
        default: () => ({ enabled: false }),
      },
      google: {
        type: providerLinkSchema,
        default: () => ({ enabled: false }),
      },
      github: {
        type: providerLinkSchema,
        default: () => ({ enabled: false }),
      },
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ 'providers.google.providerId': 1 }, { unique: true, sparse: true });
userSchema.index({ 'providers.github.providerId': 1 }, { unique: true, sparse: true });

userSchema.methods.toPublicAuthUser = function toPublicAuthUser() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    avatarUrl: this.avatarUrl,
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
    providers: {
      password: Boolean(this.providers?.password?.enabled),
      google: Boolean(this.providers?.google?.providerId),
      github: Boolean(this.providers?.github?.providerId),
    },
  };
};

module.exports = mongoose.model('User', userSchema);
