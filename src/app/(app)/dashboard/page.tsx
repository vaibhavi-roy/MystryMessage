'use client'
import { useSession } from 'next-auth/react'
import React, { useCallback, useEffect } from 'react'
import { useState } from "react"
import { Message } from "@/model/User"
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AcceptMessageSchema } from '@/schemas/acceptMessageSchema'
import axios, { AxiosError } from 'axios'
import { ApiResponse } from '@/types/ApiResponse'
import { User } from 'next-auth'
import { Loader2, RefreshCcw } from 'lucide-react'
// Note: Separator and Button are likely from a UI library like shadcn/ui, not react-email or radix-ui directly
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import MessageCard from '@/components/MessageCard'


const Page = () => {
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSwitchLoading, setIsSwitchLoading] = useState(false)

    const handleDeleteMessage = (messageId: string) => {
        setMessages(messages.filter((message) => message._id !== messageId))
    }

    const { data: session } = useSession()

    const form = useForm({
        resolver: zodResolver(AcceptMessageSchema)
    })

    const { register, watch, setValue } = form;

    // Correctly get the value from watch
    const acceptMessages = watch('acceptMessages')

    const fetchAcceptMessage = useCallback(async () => {
        setIsSwitchLoading(true)
        try {
            const response = await axios.get('/api/accept-messages')
            setValue('acceptMessages', response.data.isAcceptingMessages)
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast.error('Error', {
                description: axiosError.response?.data.message || "Failed to fetch message settings",
            });
        } finally {
            setIsSwitchLoading(false)
        }
    }, [setValue])

    const fetchMessages = useCallback(async (refresh: boolean = false) => {
        setIsLoading(true)
        setIsSwitchLoading(false)
        try {
            const response = await axios.get<ApiResponse>('/api/get-messages')
            setMessages(response.data.messages || [])
            if (refresh) {
                toast.success('Refreshed Messages', {
                    description: "Showing latest messages",
                });
            }
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast.error('Error', {
                description: axiosError.response?.data.message || "Failed to fetch message settings",
            });
        } finally {
            setIsLoading(false)
            setIsSwitchLoading(false)
        }
    }, [setIsLoading, setMessages])

    useEffect(() => {
        if (!session || !session.user) return
        fetchMessages()
        fetchAcceptMessage()
    }, [session, setValue, fetchAcceptMessage, fetchMessages])

    const handleSwitchChange = async () => {
        try {
            const response = await axios.post<ApiResponse>('/api/accept-messages', {
                acceptMessages: !acceptMessages // Note: Corrected the payload key
            })
            setValue('acceptMessages', !acceptMessages)
            toast.success('Success', {
                description: response.data.message,
            });
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>
            toast.error('Error', {
                description: axiosError.response?.data.message || "Failed to update message settings",
            });
        }
    }

    // It's safer to handle the case where session or session.user might be null/undefined initially
    const username = session?.user?.username as string

    // This code can throw an error on server-side rendering. It's better to move it inside a useEffect or a function.
    const [profileUrl, setProfileUrl] = useState('');
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const baseUrl = `${window.location.protocol}//${window.location.host}`
            setProfileUrl(`${baseUrl}/u/${username}`)
        }
    }, [username]);


    const copyToClipboard = () => {
        navigator.clipboard.writeText(profileUrl)
        toast.success('URL Copied', {
            description: "Profile URL has been copied to clipboard",
        });
    }

    if (!session || !session.user) {
        return <div>Please login</div>
    }

    return (
        <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
            <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

            <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{' '}
                <div className="flex items-center">
                    <input
                        type="text"
                        value={profileUrl}
                        disabled
                        className="input input-bordered w-full p-2 mr-2"
                    />
                    <Button onClick={copyToClipboard}>Copy</Button>
                </div>
            </div>

            <div className="mb-4 flex items-center">
                <Switch
                    {...register('acceptMessages')}
                    checked={acceptMessages}
                    onCheckedChange={handleSwitchChange}
                    disabled={isSwitchLoading}
                />
                <span className="ml-2">
                    Accept Messages: {acceptMessages ? 'On' : 'Off'}
                </span>
            </div>
            <Separator />

            <Button
                className="mt-4"
                variant="outline" // Assuming a variant for the button
                onClick={(e) => {
                    e.preventDefault();
                    fetchMessages(true);
                }}
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <RefreshCcw className="h-4 w-4" />
                )}
            </Button>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                {messages.length > 0 ? (
                    messages.map((message) => (
                        <MessageCard
                            key={message._id as string} // ✨ FIX APPLIED HERE
                            message={message}
                            onMessageDelete={handleDeleteMessage}
                        />
                    ))
                ) : (
                    <p>No messages to display.</p>
                )}
            </div>
        </div>
    )
}

export default Page