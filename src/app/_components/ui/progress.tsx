type Props = {
  value: number;
};

const Progress = ({ value }: Props) => {
  return (
    <div className="h-3 w-full rounded-full bg-gray-100">
      <div
        className="h-3 rounded-full bg-primary"
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

export { Progress };
