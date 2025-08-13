'use client';
import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export default function Button(props: Props) {
  const { className, variant = 'primary', size = 'md', ...rest } = props;

  const sizeCls = size === 'sm' ? 'px-3 py-2 text-sm' : size === 'lg' ? 'px-6 py-3 text-base' : 'px-5 py-3 text-sm';
  const variantCls =
    variant === 'primary'
      ? 'bg-[#5B8CFF] text-white hover:bg-[#386BFF]'
      : variant === 'secondary'
      ? 'bg-white text-[#386BFF] border border-[rgba(13,24,46,0.06)] hover:bg-white/90'
      : variant === 'danger'
      ? 'bg-[#EF4444] text-white hover:bg-[#dc2626]'
      : 'bg-transparent text-[#386BFF] hover:bg-white/20';

  return (
    <button
      {...rest}
      className={`rounded-2xl font-semibold shadow-[0_8px_30px_rgb(0,0,0,0.12)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 transition ${sizeCls} ${variantCls} ${className ?? ''}`}
    />
  );
}


