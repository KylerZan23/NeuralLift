'use client';
import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';

export const ToastProvider = ToastPrimitives.Provider;
export const ToastViewport = (props: React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>) => (
  <ToastPrimitives.Viewport
    className="fixed inset-x-0 bottom-4 z-50 flex justify-center gap-2 p-4"
    {...props}
  />
);

export const ToastRoot = (props: React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>) => (
  <ToastPrimitives.Root
    className="rounded-xl bg-white text-gray-900 px-4 py-3 shadow-xl"
    {...props}
  />
);

export const ToastTitle = ToastPrimitives.Title;
export const ToastDescription = ToastPrimitives.Description;
export const ToastAction = ToastPrimitives.Action;
export const ToastClose = ToastPrimitives.Close;


