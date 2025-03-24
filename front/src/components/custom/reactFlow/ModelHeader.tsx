import { memo } from "react";
import ModelHeaderToolbar from "./ModelHeaderToolbar";
import { ReactFlowModelData } from "@/types/modelType";



type ModelNodeProps = {
  data: ReactFlowModelData;
  selected: boolean;
};

function ModelHeader({ data, selected }:  ModelNodeProps ) {

  return (
          <div className={` h-10  bg-card-foreground border-border rounded-t-lg text-primary-foreground flex flex-col justify-center items-center`}>
            <div className={`${selected === true ? "h-10" : "h-5"} transition-all`}> {data.label}</div>
            <div className={`${selected === true ? "h-5" : "h-0"} transition-all w-full flex justify-between`}>
                <ModelHeaderToolbar selected={selected} data={data}/>
            </div>
            </div>

  );
}

export default memo(ModelHeader);
