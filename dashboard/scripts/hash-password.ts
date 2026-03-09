/**
 * Generate a PBKDF2 password hash for AUTH_PASSWORD_HASH.
 *
 * Usage:
 *   pnpm hash-password <password>
 *   pnpm hash-password            # prompts interactively
 */
import { hashPassword, verifyPassword } from '../src/lib/server/password';
import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';

async function readPasswordFromStdin(): Promise<string> {
    const rl = createInterface({ input: stdin, output: stdout });
    const password = await rl.question('Enter password: ');
    rl.close();
    return password;
}

async function main(): Promise<void> {
    const password = process.argv[2] ?? (await readPasswordFromStdin());

    if (!password) {
        console.error('Error: password cannot be empty');
        process.exit(1);
    }

    const hash = await hashPassword(password);

    // Verify the hash works before printing
    const valid = await verifyPassword(password, hash);
    if (!valid) {
        console.error('Error: hash verification failed');
        process.exit(1);
    }

    console.log('\nAdd this to your .env file:\n');
    console.log(`AUTH_PASSWORD_HASH=${hash}`);
}

main();
