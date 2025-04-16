import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';
import xss from 'xss';

const prisma = new PrismaClient();
const saltRounds = 10;

export async function POST(request: Request){
    try{
        const { name, email, password } = await request.json();

        const sprittadName = xss(name);
        const sprittadEmail = xss(email);

        if(!sprittadName || !sprittadEmail || !password){
            return NextResponse.json(
                { error: 'Nafn, netfang og lykilorð mega ekki vera tóm' },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = await prisma.user.create({
            data: {
                name: sprittadName,
                email: sprittadEmail,
                password: hashedPassword,
            }
        });
        const { password: _, ...userWithoutPassword} = user;
        console.log(_);
        return NextResponse.json(userWithoutPassword, { status: 201 });
    } catch(error){
        console.error('Nýskráningar villa: ', error);
        return NextResponse.json(
            { error: 'Nýskráning feilaði '}, 
            { status: 500 });
    }
}