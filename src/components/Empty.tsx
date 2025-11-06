import { cn } from "@/lib/utils";

/**
 * @description 空状态组件，用于在没有数据时显示。
 * @returns {React.ReactElement} 空状态组件。
 */
export default function Empty() {
  return (
    <div className={cn("flex h-full items-center justify-center")}>Empty</div>
  );
}