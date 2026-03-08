type PageHeaderProps = {
  title: string;
};

function PageHeader({ title }: PageHeaderProps) {
  return <h1 className="text-[40px] font-semibold text-[#1F2430]">{title}</h1>;
}

export default PageHeader;