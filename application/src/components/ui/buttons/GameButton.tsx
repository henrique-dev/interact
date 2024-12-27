import { twJoin, twMerge } from 'tailwind-merge';

type ButtonColorName = 'green' | 'blue' | 'red' | 'orange' | 'purple' | 'gray';

const buttonMainColors: { [key in ButtonColorName]: string } = {
  green: 'bg-green-700 disabled:bg-green-800',
  blue: 'bg-blue-700 disabled:bg-blue-800',
  red: 'bg-red-700 disabled:bg-red-800',
  orange: 'bg-orange-700 disabled:bg-orange-800',
  purple: 'bg-purple-700 disabled:bg-purple-800',
  gray: 'bg-gray-700 disabled:bg-gray-800',
};

const buttonSecondaryColors: { [key in ButtonColorName]: string } = {
  green: 'bg-green-500 hover:bg-green-400 group-disabled:bg-green-700',
  blue: 'bg-blue-500 hover:bg-blue-400 group-disabled:bg-blue-700',
  red: 'bg-red-500 hover:bg-red-400 group-disabled:bg-red-700',
  orange: 'bg-orange-500 hover:bg-orange-400 group-disabled:bg-orange-700',
  purple: 'bg-purple-500 hover:bg-purple-400 group-disabled:bg-purple-700',
  gray: 'bg-gray-500 hover:bg-gray-400 group-disabled:bg-gray-700',
};

type GameButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  buttonColor?: ButtonColorName;
};

export const GameButton = ({ className, buttonColor = 'blue', children, ...rest }: GameButtonProps) => {
  return (
    <button
      {...rest}
      className={twMerge(
        'group cursor-pointer rounded-xl border-0 text-white outline-offset-4 disabled:cursor-default',
        buttonMainColors[buttonColor],
        className
      )}
    >
      <span
        className={twJoin(
          'block translate-y-[-6px] rounded-xl px-6 py-3',
          'group-active:translate-y-[-2px] group-disabled:translate-y-[-6px]',
          buttonSecondaryColors[buttonColor]
        )}
      >
        {children}
      </span>
    </button>
  );
};
