import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../services/api';

// Left-hand catalog navigation, like B2Sign's category column.
export default function CategorySidebar() {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    let alive = true;
    getCategories()
      .then((data) => alive && setGroups(data.navGroups || []))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    <aside className="cat-sidebar">
      {groups.map((group) => (
        <div className="cat-group" key={group.name}>
          <div className="cat-group-title">{group.name}</div>
          <ul>
            {group.items.map((item) => (
              <li key={item.slug}>
                <Link to={`/products/${item.slug}`}>
                  {item.name}
                  <span className="cat-chevron">›</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="cat-help">
        <strong>Need a custom size?</strong>
        <p>Our team quotes anything. Send specs and we'll price it.</p>
        <Link className="btn btn-blue btn-sm btn-block" to="/quote">Request a Quote</Link>
      </div>
    </aside>
  );
}
