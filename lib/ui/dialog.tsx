'use client';
import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

function DialogOverlay(props: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out"
      {...props}
    />
  );
}

function DialogContent({ className, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 grid w-full max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-2xl bg-white p-6 text-gray-900 shadow-2xl outline-none',
          className
        )}
        {...props}
      />
    </DialogPortal>
  );
}

function DialogHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', props.className)} {...props} />;
}

function DialogFooter(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center justify-end gap-3', props.className)} {...props} />;
}

const DialogTitle = DialogPrimitive.Title;
const DialogDescription = DialogPrimitive.Description;

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose
};


