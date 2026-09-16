const categories = ["", "Electronics", "Fashion", "Books", "Home"];

export default function SearchBar({ search, category, onSearchChange, onCategoryChange }) {
  return (
    <div className="catalogue-controls">
      <label className="sr-only" htmlFor="product-search">Search products</label>
      <input
        id="product-search"
        type="search"
        placeholder="Search products..."
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      <label className="sr-only" htmlFor="product-category">Filter by category</label>
      <select id="product-category" value={category} onChange={(event) => onCategoryChange(event.target.value)}>
        {categories.map((item) => <option key={item || "all"} value={item}>{item || "All Categories"}</option>)}
      </select>
    </div>
  );
}
