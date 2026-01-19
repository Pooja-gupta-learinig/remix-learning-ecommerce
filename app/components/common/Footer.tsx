export  function Footer() {
  return (
    <footer className="border-t bg-blue-500 mt-8">
      <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600 text-sm">
        &copy; {new Date().getFullYear()} E-CommerceShop. All rights reserved.
      </div>
    </footer>
  );
}