import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/User';
import TestResult from '../models/TestResult';

interface CustomRequest extends Request {
  userId?: string | JwtPayload;
}

export const register = async (req: Request, res: Response) => {
  const { email, password, googleId } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (googleId) {
        if (!existingUser.googleId) {
          return res.status(400).json({ message: 'Account already exists. Please log in with your email and password.' });
        }

        const token = jwt.sign(
          { id: existingUser._id, email: existingUser.email, role: existingUser.role },
          process.env.JWT_SECRET!,
          { expiresIn: '1h' }
        );

        return res.status(200).json({ result: existingUser, token });
      }

      return res.status(400).json({ message: 'User already exists' });
    }

    let hashedPassword;
    if (googleId) {
      hashedPassword = await bcrypt.hash('GoogleLogin', 12);
    } else {
      if (!password) {
        return res.status(400).json({ message: 'Password is required for standard registration' });
      }
      hashedPassword = await bcrypt.hash(password, 12);
    }

    const newUser = new User({
      email,
      password: hashedPassword,
      role: 'user',
      googleId,
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    res.status(201).json({ result: newUser, token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password, googleId } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      if (googleId) {
        const newUser = new User({
          email,
          password: await bcrypt.hash('GoogleLogin', 12),
          role: 'user',
          googleId,
        });

        await newUser.save();

        const token = jwt.sign(
          { id: newUser._id, email: newUser.email, role: newUser.role },
          process.env.JWT_SECRET!,
          { expiresIn: '1h' }
        );

        return res.status(201).json({ result: newUser, token });
      }

      return res.status(404).json({ message: 'User not found' });
    }

    if (googleId) {
      if (!user.googleId) {
        return res.status(400).json({
          message: 'Account was created with email and password. Please log in using your credentials.',
        });
      }

      if (user.googleId !== googleId) {
        return res.status(400).json({ message: 'Invalid Google ID' });
      }
    } else {
      if (user.googleId) {
        return res.status(400).json({ message: 'Account requires Google Login' });
      }

      if (!password) {
        return res.status(400).json({ message: 'Password is required' });
      }

      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    res.status(200).json({ result: user, token });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


export const verifyToken = (req: CustomRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to authenticate token' });
    }
    req.userId = (decoded as JwtPayload).id;
    console.log('Decoded token:', decoded);

    next();
  });
};

export const updateUserProfile = async (req: CustomRequest, res: Response) => {
  const { email } = req.body;

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.email = email || user.email;
    await user.save();

    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const changePassword = async (req: CustomRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid current password' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteUserAccount = async (req: CustomRequest, res: Response) => {
  try {
    await User.findByIdAndDelete(req.userId);
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const exportUserData = async (req: CustomRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const testResults = await TestResult.find({ userId: user._id });

    const userData = {
      email: user.email,
      testResults: testResults.map(result => ({
        date: result.date,
        score: result.score
      })),
    };

    res.status(200).json({ userData });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
export const updateUserSettings = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { useOptimizedQuestions } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { useOptimizedQuestions },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'Settings updated', user });
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
export const purchasePackage = async (req: CustomRequest, res: Response) => {
  const { days } = req.body;

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentDate = new Date();
    let newExpirationDate: Date;

    if (user.packageExpiration && user.packageExpiration > currentDate) {
      newExpirationDate = new Date(user.packageExpiration);
      newExpirationDate.setDate(newExpirationDate.getDate() + days);
    } else {
      newExpirationDate = new Date(currentDate.setDate(currentDate.getDate() + days));
    }

    user.packageExpiration = newExpirationDate;
    await user.save();

    res.status(200).json({ message: 'Package purchased successfully', packageExpiration: newExpirationDate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUser = async (req: CustomRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
