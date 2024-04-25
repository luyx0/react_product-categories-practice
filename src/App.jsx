/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import './App.scss';

import cn from 'classnames';
import 'bulma/css/bulma.css';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';
import { columns } from './api/columns';

export const App = () => {
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState({ column: '', order: '' });

  const products = productsFromServer.map(product => {
    const category = categoriesFromServer.find(
      // eslint-disable-next-line no-shadow
      category => category.id === product.categoryId,
    ); // find by product.categoryId
    const owner = usersFromServer.find(user => user.id === category.ownerId); // find by category.ownerId

    return { ...product, category, owner };
  });

  function applyFilters(product) {
    const isOwnerMatch = !selectedOwner || product.owner.name === selectedOwner;
    const isCategoryMatch =
      selectedCategories.length === 0 ||
      selectedCategories.includes(product.category);
    const isNameMatch =
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase());

    return isOwnerMatch && isCategoryMatch && isNameMatch;
  }

  function applySorting(a, b) {
    switch (sortBy.column) {
      case 'id':
        return sortBy.order === 'asc' ? a.id - b.id : b.id - a.id;
      case 'name':
        return sortBy.order === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      case 'category':
        return sortBy.order === 'asc'
          ? a.category.title.localeCompare(b.category.title)
          : b.category.title.localeCompare(a.category.title);
      case 'owner':
        return sortBy.order === 'asc'
          ? a.owner.name.localeCompare(b.owner.name)
          : b.owner.name.localeCompare(a.owner.name);
      default:
        return 0;
    }
  }

  const filteredProducts = products.filter(applyFilters).sort(applySorting);

  const handleOwnerSelect = owner => {
    setSelectedOwner(owner === selectedOwner ? null : owner);
  };

  const handleCategorySelect = category => {
    setSelectedCategories(prevSelectedCategories => {
      if (prevSelectedCategories.includes(category)) {
        return prevSelectedCategories.filter(some => some !== category);
      }

      return [...prevSelectedCategories, category];
    });
  };

  const handleResetAllFilters = () => {
    setSelectedOwner(null);
    setSelectedCategories([]);
    setSearchQuery('');
    setSortBy({ column: '', order: '' });
  };

  const handleSort = column => {
    if (sortBy.column === column) {
      if (sortBy.order === 'asc') {
        setSortBy({ column, order: 'desc' });
      } else if (sortBy.order === 'desc') {
        setSortBy({ column: '', order: '' });
      } else {
        setSortBy({ column, order: 'asc' });
      }
    } else {
      setSortBy({ column, order: 'asc' });
    }
  };

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                data-cy="FilterAllUsers"
                href="#/"
                className={cn({ 'is-active': !selectedOwner })}
                onClick={() => handleOwnerSelect(null)}
              >
                All
              </a>
              {usersFromServer.map(user => (
                <a
                  data-cy="FilterUser"
                  href="#/"
                  key={user.id}
                  className={cn({
                    'is-active': selectedOwner === user.name,
                  })}
                  onClick={() => handleOwnerSelect(user.name)}
                >
                  {user.name}
                </a>
              ))}
            </p>

            {/* Search by name */}
            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <span
                  className="icon is-left"
                  onClick={() => setSearchQuery('')}
                >
                  <i className="fas fa-search" aria-hidden="false" />
                </span>
                {searchQuery && (
                  <span className="icon is-right">
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setSearchQuery('')}
                    />
                  </span>
                )}
              </p>
            </div>

            {/* Filter by category */}
            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={cn('button is-success mr-6', {
                  'is-outlined': selectedCategories.length !== 0,
                })}
                onClick={() => setSelectedCategories([])}
              >
                All
              </a>
              {categoriesFromServer.map(category => (
                <a
                  key={category.id}
                  className={cn('button mr-2 my-1', {
                    'is-info': selectedCategories.includes(category),
                  })}
                  onClick={() => handleCategorySelect(category)}
                >
                  <span>{category.title}</span>
                </a>
              ))}
            </div>

            {/* Reset All Filters */}
            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={handleResetAllFilters}
              >
                Reset all filters
              </a>
            </div>
          </nav>

          {/* Table */}
          <div className="box table-container">
            <table
              data-cy="ProductTable"
              className="table is-striped is-narrow is-fullwidth"
            >
              <thead>
                <tr>
                  {columns.map((column, index) => {
                    return (
                      <th key={column.key} className={`column-${index + 1}`}>
                        <span className="is-flex is-flex-wrap-nowrap">
                          {column.title}
                          <a href="#/" onClick={() => handleSort(column.key)}>
                            <span className="icon">
                              <i
                                data-cy="SortIcon"
                                className={cn('fas', {
                                  'fa-sort-up':
                                    sortBy.column === column.key &&
                                    sortBy.order === 'asc',
                                  'fa-sort-down':
                                    sortBy.column === column.key &&
                                    sortBy.order === 'desc',
                                  'fa-sort': sortBy.column !== column.key,
                                })}
                              />
                            </span>
                          </a>
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <p data-cy="NoMatchingMessage">
                    No products matching selected criteria
                  </p>
                ) : (
                  filteredProducts.map(product => (
                    <tr key={product.id}>
                      <td className="has-text-weight-bold">{product.id}</td>
                      <td>{product.name}</td>
                      <td>
                        {product.category.icon} - {product.category.title}
                      </td>
                      <td>
                        <span
                          className={cn({
                            'has-text-link': product.owner.sex === 'm',
                            'has-text-danger': product.owner.sex === 'f',
                          })}
                        >
                          {product.owner.name}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
