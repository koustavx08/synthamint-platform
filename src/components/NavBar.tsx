import { Link } from 'react-router-dom';

const NavBar = () => (
  <nav className="w-full bg-white border-b mb-6">
    <div className="container mx-auto flex gap-4 py-3 px-4">
      <Link to="/" className="font-bold text-indigo-600 hover:underline">Home</Link>
      <Link to="/storymint" className="text-slate-700 hover:underline">StoryMint</Link>
      <Link to="/gallery" className="text-slate-700 hover:underline">Gallery</Link>
    </div>
  </nav>
);

export default NavBar;
