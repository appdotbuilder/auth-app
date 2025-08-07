
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type RegisterInput } from '../schema';
import { registerUser } from '../handlers/register_user';
import { eq } from 'drizzle-orm';

const testInput: RegisterInput = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123'
};

describe('registerUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should register a new user successfully', async () => {
    const result = await registerUser(testInput);

    expect(result.success).toBe(true);
    expect(result.message).toEqual('User registered successfully');
    expect(result.user).toBeDefined();
    expect(result.user?.username).toEqual('testuser');
    expect(result.user?.email).toEqual('test@example.com');
    expect(result.user?.id).toBeDefined();
    expect(result.user?.created_at).toBeInstanceOf(Date);
    expect(result.user?.updated_at).toBeInstanceOf(Date);
  });

  it('should save user to database with hashed password', async () => {
    const result = await registerUser(testInput);

    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, result.user!.id))
      .execute();

    expect(users).toHaveLength(1);
    const savedUser = users[0];
    expect(savedUser.username).toEqual('testuser');
    expect(savedUser.email).toEqual('test@example.com');
    expect(savedUser.password_hash).toBeDefined();
    expect(savedUser.password_hash).not.toEqual('password123'); // Password should be hashed
    expect(savedUser.created_at).toBeInstanceOf(Date);
    expect(savedUser.updated_at).toBeInstanceOf(Date);
  });

  it('should reject duplicate username', async () => {
    // Register first user
    await registerUser(testInput);

    // Try to register with same username but different email
    const duplicateUsernameInput: RegisterInput = {
      username: 'testuser',
      email: 'different@example.com',
      password: 'password456'
    };

    const result = await registerUser(duplicateUsernameInput);

    expect(result.success).toBe(false);
    expect(result.message).toEqual('User with this username already exists');
    expect(result.user).toBeUndefined();
  });

  it('should reject duplicate email', async () => {
    // Register first user
    await registerUser(testInput);

    // Try to register with same email but different username
    const duplicateEmailInput: RegisterInput = {
      username: 'differentuser',
      email: 'test@example.com',
      password: 'password456'
    };

    const result = await registerUser(duplicateEmailInput);

    expect(result.success).toBe(false);
    expect(result.message).toEqual('User with this email already exists');
    expect(result.user).toBeUndefined();
  });

  it('should verify password is properly hashed', async () => {
    const result = await registerUser(testInput);

    const users = await db.select()
      .from(usersTable)
      .where(eq(usersTable.id, result.user!.id))
      .execute();

    const savedUser = users[0];
    
    // Verify password can be verified using Bun's password verification
    const isValidPassword = await Bun.password.verify('password123', savedUser.password_hash);
    const isInvalidPassword = await Bun.password.verify('wrongpassword', savedUser.password_hash);
    
    expect(isValidPassword).toBe(true);
    expect(isInvalidPassword).toBe(false);
  });
});
