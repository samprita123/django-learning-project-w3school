import { Link } from "@tanstack/react-router";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card, CardHeader } from "@/components/ui/Primitives";
import { useRoomStatusDonutQuery } from "@/services/mock/queries";

export function HousekeepingOverview() {
  const { data: roomStatusDonut = [] } = useRoomStatusDonutQuery();

  return (
    <Card>
      <CardHeader
        title="Housekeeping Overview"
        hint="120 rooms"
        action={
          <Link to="/housekeeping" className="text-[12px] font-medium text-primary">
            Open →
          </Link>
        }
      />
      <div className="flex items-center gap-4 p-5">
        <ResponsiveContainer width="55%" height={170}>
          <PieChart>
            <Pie
              data={roomStatusDonut}
              dataKey="value"
              innerRadius={42}
              outerRadius={66}
              paddingAngle={2}
              stroke="none"
            >
              {roomStatusDonut.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <ul className="flex-1 space-y-2 text-[12px]">
          {roomStatusDonut.map((d) => (
            <li key={d.name} className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-text-secondary">
                <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                {d.name}
              </span>
              <span className="font-mono font-medium text-text-primary">{d.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
