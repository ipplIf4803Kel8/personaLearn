import {
  createContext,
  useContext,
  useMemo,
  useState
} from "react";
const DashboardNavigationContext = createContext(
  null
);
function DashboardNavigationProvider({
  children,
  initialPathname = "/"
}) {
  const [pathname, setPathname] = useState(initialPathname);
  const [query, setQuery] = useState("");
  const value = useMemo(
    () => ({
      pathname,
      query,
      setQuery,
      navigate: (href) => {
        setPathname(href);
        setQuery("");
      }
    }),
    [pathname, query]
  );
  return <DashboardNavigationContext.Provider value={value}>
      {children}
    </DashboardNavigationContext.Provider>;
}
function useDashboardNavigation() {
  const context = useContext(DashboardNavigationContext);
  if (!context) {
    throw new Error(
      "useDashboardNavigation must be used within DashboardNavigationProvider"
    );
  }
  return context;
}
const matchesQuery = (query, ...fields) => {
  const q = query.trim().toLowerCase();
  return !q || fields.some((f) => String(f ?? "").toLowerCase().includes(q));
};
function DashboardLink({
  href,
  onClick,
  ...props
}) {
  const { navigate } = useDashboardNavigation();
  function handleClick(event) {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    navigate(href);
  }
  return <a href={href} onClick={handleClick} {...props} />;
}
export {
  matchesQuery,
  DashboardLink,
  DashboardNavigationProvider,
  useDashboardNavigation
};
