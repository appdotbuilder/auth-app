
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type LoginInput } from '../schema';
import { loginUser } from '../handlers/login_user';

// Test input
const testLoginInput: LoginInput = {
  email: 'test@example.com',
  password: 'password123'
};

describe('loginUser', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should login user with valid credentials', async () => {
    // Create a test user first
    const passwordHash = await Bun.password.hash(testLoginInput.password);
    await db.insert(usersTable).values({
      username: 'testuser',
      email: testLoginInput.email,
      password_hash: passwordHash
    }).execute();

    const result = await loginUser(testLoginInput);

    expect(result.success).toBe(true);
    expect(result.message).toEqual('Login successful');
    expect(result.user).toBeDefined();
    expect(result.user!.email).toEqual(testLoginInput.email);
    expect(result.user!.username).toEqual('testuser');
    expect(result.user!.id).toBeDefined();
    expect(result.user!.created_at).toBeInstanceOf(Date);
    expect(result.user!.updated_at).toBeInstanceOf(Date);
  });

  it('should reject login with invalid email', async () => {
    // Create a test user with different email
    const passwordHash = await Bun.password.hash('password123');
    await db.insert(usersTable).values({
      username: 'testuser',
      email: 'other@example.com',
      password_hash: passwordHash
    }).execute();

    const result = await loginUser({
      email: 'nonexistent@example.com',
      password: 'password123'
    });

    expect(result.success).toBe(false);
    expect(result.message).toEqual('Invalid email or password');
    expect(result.user).toBeUndefined();
  });

  it('should reject login with invalid password', async () => {
    // Create a test user
    const passwordHash = await Bun.password.hash('correctpassword');
    await db.insert(usersTable).values({
      username: 'testuser',
      email: testLoginInput.email,
      password_hash: passwordHash
    }).execute();

    const result = await loginUser({
      email: testLoginInput.email,
      password: 'wrongpassword'
    });

    expect(result.success).toBe(false);
    expect(result.message).toEqual('Invalid email or password');
    expect(result.user).toBeUndefined();
  });

  it('should not expose password hash in response', async () => {
    // Create a test user
    const passwordHash = await Bun.password.hash(testLoginInput.password);
    await db.insert(usersTable).values({
      username: 'testuser',
      email: testLoginInput.email,
      password_hash: passwordHash
    }).execute();

    const result = await loginUser(testLoginInput);

    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    // Ensure password_hash is not included in the response
    expect((result.user as any).password_hash).toBeUndefined();
  });
});
