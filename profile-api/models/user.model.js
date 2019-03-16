const mongoose = require('mongoose');
const CITIES = ['Madrid', 'Barcelona', 'Miami', 'Paris', 'Berlin', 'Amsterdam', 'Mexico', 'Sao Paulo'];
const COURSES = ['WebDev', 'UX/UI', 'Data Analytics'];
const PASSWORD_PATTERN = /^(?=\w*\d)(?=\w*[A-Z])(?=\w*[a-z])\S{6,}$/;
const EMAIL_PATTERN = /^(([^<>()\[\]\.,;:\s@\“]+(\.[^<>()\[\]\.,;:\s@\“]+)*)|(\“.+\“))@(([^<>()[\]\.,;:\s@\“]+\.)+[^<>()[\]\.,;:\s@\“]{2,})$/i;
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: EMAIL_PATTERN
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    match: PASSWORD_PATTERN
  },
  campus: {
    type: String,
    enum: CITIES
  },
  course: {
    type: String,
    enum: COURSES
  },
  avatarURL: {
    type: String
  }
}, {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = doc._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret
      }
    }
  }
)           

userSchema.pre('save', function(next) {
  const user = this;

  if ( !user.isModified('password')) {
    next();
  } else {
    bcrypt.genSalt(SALT_WORK_FACTOR)
      .then(salt => {
        return bcrypt.hash(user.password, salt)
          .then(hash => {
            console.log("HASEO LA PASSS")
            user.password = hash;
            next();
          })
      })
      .catch(error => next(error))
  }
});

userSchema.methods.checkPassword = function(password) {
  return bcrypt.compare(password, this.password);
}

const User = mongoose.model('User', userSchema)

module.exports = User