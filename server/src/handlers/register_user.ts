
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type RegisterInput, type AuthResponse } from '../schema';
import { eq, or } from 'drizzle-orm';

export const registerUser = async (input: RegisterInput): Promise<AuthResponse> => {
  try {
    // Check if username or email already exists
    const existingUser = await db.select()
      .from(usersTable)
      .where(
        or(
          eq(usersTable.username, input.username),
          eq(usersTable.email, input.email)
        )
      )
      .execute();

    if (existingUser.length > 0) {
      const existingField = existingUser[0].username === input.username ? 'username' : 'email';
      return {
        success: false,
        message: `User with this ${existingField} already exists`
      };
    }

    // Hash the password (using Bun's built-in password hashing)
    const passwordHash = await Bun.password.hash(input.password);

    // Insert new user
    const result = await db.insert(usersTable)
      .values({
        username: input.username,
        email: input.email,
        password_hash: passwordHash
      })
      .returning()
      .execute();

    const user = result[0];

    return {
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    };
  } catch (error) {
    console.error('User registration failed:', error);
    throw error;
  }
};
