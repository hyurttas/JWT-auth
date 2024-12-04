import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

// Interface for the request body
interface RegisterRequest {
    email: string;
    password: string;
}

// Interface for the stored user
interface User {
    email: string;
    password: string;
    createdAt: string;
}

export async function POST(request: Request) {
    const body: RegisterRequest = await request.json();
    
    try {
        const existingEmail = await prisma.user.findUnique({
            where:{
                email: body.email
            }
        })

        // Validate input
        if (!body.email || !body.password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }
        const characters = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        // Validate password strength
        if (body.password.length < 8) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters long' },
                { status: 400 }
            );
        }else if(!body.password.match(characters)){
            return NextResponse.json(
                { error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' },
                { status: 400 }
            )
        }else if(existingEmail){
            return NextResponse.json(
                { error: 'Email already exists' },
                { status: 400 }
            )
        }

        // Generate salt and hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(body.password, salt);
        console.log('Hashed password:', hashedPassword);
        
        // Create user object (in practice, you'd save this to a database)
        
        try {
            await prisma.user.create({ data:{
                email: body.email,
                password: String(hashedPassword),

            } });
            console.log('User created successfully');
        } catch (error) {
            console.log(error);
            
        }

        // Example of verifying password (you'd typically do this in a login route)
        const isMatch = await bcrypt.compare(body.password, hashedPassword);
        console.log('Password verification:', isMatch); // Should be true

        return NextResponse.json({
            message: 'User registered successfully',
            user: {
                email: body.email,
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
