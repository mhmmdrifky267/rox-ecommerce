export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {/* nanti kita isi Navbar di sini */}
      <main>{children}</main>
    </div>
  );
}