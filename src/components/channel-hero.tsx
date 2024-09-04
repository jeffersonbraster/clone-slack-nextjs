import { format } from "date-fns";

interface ChannelHeroProps {
  name: string;
  creationTime: number;
}

const ChannelHero = ({name, creationTime}: ChannelHeroProps) => {
  return (
    <div className="mt-[88px] mx-5 mb-4">
      <p className="text-2xl font-bold flex item mb-2">
        # {name}
      </p>
      <p className="font-normal text-slate-800 mb-4">
        Esse canal foi criado em {format(creationTime, "dd/MM/yyyy")}. Este é o começo do canal <strong>{name}</strong> 
      </p>
    </div>
  )
}

export default ChannelHero