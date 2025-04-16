import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'jwt_lykilord';

export function middleware(request: NextRequest){
    const protectedPaths = ['dashboard', '/admin'];
    const { pathname } = request.nextUrl;

    if(protectedPaths.some((p) => pathname.startsWith(p))){
        const token = request.cookies.get('token')?.value;
        if(!token){
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
        try{
            jwt.verify(token, JWT_SECRET);
        } catch(error){
            console.log(error);
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
    }
    return NextResponse.next();
}