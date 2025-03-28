'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';

type FormData = {
  email: string;
};

export default function WaitlistForm() {
  const t = useTranslations('CTA');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch('https://api.getwaitlist.com/api/v1/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          waitlist_id: Number(process.env.WAITLIST_ID),
          referral_link: window.location.href,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to join the waitlist.');
      }

      setSuccessMessage('Thank you! We will be in touch with you soon.');
      reset();
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex size-full p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-2">
            <p className="max-w-[900px] tracking-wider md:text-xl/loose lg:text-base/relaxed xl:text-xl/relaxed">
              <strong>{t('contact_label')}</strong>
            </p>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^\S[^\s@]*@\S[^\s.]*\.\S+$/,
                  message: 'Invalid email address',
                },
              })}
              className="rounded-md border border-gray-200 p-2 text-base text-gray-700"
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>
        </div>
        <div className="mt-4">
          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-secondary px-3 py-2 text-primary transition duration-300 hover:bg-primary-foreground"
          >
            {loading ? 'Submitting...' : 'Contact us'}
          </Button>
          {errorMessage && <p className="mt-2 text-sm text-red-500">{errorMessage}</p>}
          {successMessage && <p className="mt-2 text-sm text-green-600">{successMessage}</p>}
        </div>
      </form>
    </div>
  );
}
