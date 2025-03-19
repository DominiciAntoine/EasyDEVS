import { memo } from "react";
import ModelHeaderToolbar from "./ModelHeaderToolbar";



type ModelNodeProps = {
  selected: boolean
  label: string
};

function ModelHeader({ selected, label }: ModelNodeProps) {

  return (
          <div className={` h-10  bg-card-foreground border-border rounded-t-lg text-primary-foreground flex flex-col justify-center items-center`}>
            <div className={`${selected === true ? "h-10" : "h-5"} transition-all`}> {label}</div>
            <div className={`${selected === true ? "h-5" : "h-0"} transition-all w-full flex justify-between`}>
                <ModelHeaderToolbar selected={selected}/>
            </div>
            </div>

  );
}

export default memo(ModelHeader);
