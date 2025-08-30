'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as  z from 'zod'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useDebounceCallback } from 'usehooks-ts'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { signInSchema } from '@/schemas/signInSchema'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiResponse'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react'

const Page = () => {

    const [isSubmitting, setIsSubmitting] = useState(false)

    const router = useRouter()

    const form = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: '',
            password: '',
        }
    })

    const onSubmit = async (data: z.infer<typeof signInSchema>) => {
        const result = await signIn('credentials', {
            redirect: false,
            email: data.email,
            password: data.password,
        })
        if (result?.error) {
            if (result.error === 'CredentialsSignin') {
                toast.error('Error', {
                    description: 'Incorrect email or password',
                });
            } else {
                toast.error('Error', {
                    description: result.error,
                });
            }
        }
        if (result?.url) {
            router.replace('/dashboard');
        }
    }

    return (
        <div className='flex justify-center items-center min-h-screen bg-gray-100'>
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                        Join Mystery Message
                    </h1>
                    <p className="mb-4">
                        Sign up to start your anonymous adventure
                    </p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                        <FormField
                            name="email"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* Password Field */}
                        <FormField
                            name="password"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">
                            Signin
                        </Button>
                    </form>
                </Form>
                <div className="mt-4 text-center">
                    <p className="text-sm text-center">
                        Already have an account?{' '}
                        <Link href="/sign-in" className="font-medium text-blue-600 hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Page;