import type { FC } from "react";

export type IconProps = {
  src: string;
};

const iconClassName = "size-4 shrink-0";

const Icon: FC<IconProps> = ({ src }) => (
  <img src={src} className={iconClassName} alt="" aria-hidden />
);

export default Icon;
