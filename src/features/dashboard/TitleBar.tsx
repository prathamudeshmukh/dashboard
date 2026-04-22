export const TitleBar = (props: {
  title: React.ReactNode;
  description?: React.ReactNode;
}) => (
  <div className="mb-8">
    <h1 className="text-4xl font-semibold">{props.title}</h1>

    {props.description && (
      <div className="text-base font-normal text-muted-foreground">
        {props.description}
      </div>
    )}
  </div>
);
