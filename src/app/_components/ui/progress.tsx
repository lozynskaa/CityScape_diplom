type Props = {
  value: number;
};

const Progress = ({ value }: Props) => {
  return (
    <div className="h-3 w-full rounded-full bg-gray-100">
      <div
        className="bg-primary-400 h-3 rounded-full"
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

export { Progress };
