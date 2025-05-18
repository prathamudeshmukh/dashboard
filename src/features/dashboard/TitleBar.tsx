export const TitleBar = (props: {
  title: React.ReactNode;
  description?: React.ReactNode;
}) => (
  <div className="mb-8">
    <div className="text-4xl font-semibold">{props.title}</div>

    {props.description && (
      <div className="text-base font-normal text-muted-foreground">
        {props.description}
      </div>
    )}
  </div>
);
