import "@/assets/svg-types";

import { type ComponentPropsWithoutRef, type FC } from "react";

import selectChevron from "@/assets/select-chevron.svg";

type SelectProps = ComponentPropsWithoutRef<"select">;

const selectClassName =
  "appearance-none rounded border border-[#ccc] bg-white bg-[length:1.25rem_1.25rem] bg-[position:right_0.5rem_center] bg-no-repeat py-[0.35rem] pr-10 pl-2 font-[inherit]";

const Select: FC<SelectProps> = ({ className, style, ...props }) => (
  <select
    className={className ? `${selectClassName} ${className}` : selectClassName}
    style={{ backgroundImage: `url(${selectChevron})`, ...style }}
    {...props}
  />
);

export default Select;
