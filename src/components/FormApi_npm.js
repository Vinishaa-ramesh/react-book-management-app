import React, { useState, useEffect } from 'react';
import { Typography, TextField, Button, Table, TableHead, TableBody, TableRow, TableCell, InputLabel, Select, MenuItem } from '@mui/material';
import { IconButton } from '@material-ui/core';
import { Delete, Edit } from '@material-ui/icons';
import { useFormik } from 'formik';
import axios from 'axios';
import './newForm.css';

function FormApi_npm() {
  const api_url = 'http://localhost:3000/books';
  const [bookList, setBookList] = useState([]);
  const [filteredBookList, setFilteredBookList] = useState([]);

  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    fetchBooks();
  }, []);

  const [uniqueAuthors, setUniqueAuthors] = useState([]);

  useEffect(() => {
    const authors = [...new Set(bookList.map((book) => book.authorName))];
    setUniqueAuthors(authors);
  }, [bookList]);

  const fetchBooks = () => {
    axios
      .get(api_url)
      .then((res) => {
        setBookList(res.data);
        console.log(res.data);
      })
      .catch((err) => {
        console.log('Error:', err);
      });
  };

  const formik = useFormik({
    initialValues: {
      bookName: '',
      authorName: '',
      availability: true,
      date: ''
    },
    onSubmit: (values, { resetForm }) => {
      const checkBookName = bookList.filter((book) => {
        const bookName = book.bookName.toLowerCase();
        return values.bookName.toLowerCase() === bookName;
      });
    
      if (values.id){
        if (checkBookName.length === 0) {
          alert('Book not found for editing');
          resetForm();
          return;
        }
    
        axios
          .put(api_url + `/${checkBookName[0].id}`, {
            bookName: values.bookName,
            authorName: values.authorName ? values.authorName : 'N/A',
            availability: values.availability,
            date: values.date
          })
          .then((res) => {
            fetchBooks();
            resetForm();
          })
          .catch((error) => {
            console.log('Error: ' + error);
          });
      } else {
        if (checkBookName.length !== 0) {
          if (!checkBookName[0].authorName.toLowerCase().localeCompare('n/a')) {
            if (window.confirm('Replace author name?')) {
              axios
                .put(api_url + `/${checkBookName[0].id}`, {
                  bookName: values.bookName,
                  authorName: values.authorName ? values.authorName : 'N/A',
                  availability: values.availability,
                  date: values.date
                })
                .then((res) => {
                  fetchBooks();
                  resetForm();
                })
                .catch((error) => {
                  console.log('Error: ' + error);
                });
    
              return;
            } else {
              resetForm();
              return;
            }
          } else {
            alert('Book already present');
            resetForm();
            return;
          }
        }
    
        axios
          .post(api_url, {
            bookName: values.bookName,
            authorName: values.authorName ? values.authorName : 'N/A',
            availability: values.availability,
            date: values.date
          })
          .then((res) => {
            fetchBooks();
            resetForm();
          })
          .catch((err) => {
            console.log('Error: ' + err);
          });
      }
    },
    validate: (values) => {
      let errors = {};

      if (!values.bookName) {
        errors.bookName = '*required';
      }

      if (!values.date) {
        errors.date = '*select date';
      }
      return errors;
    }
  });

  const toggleAvailability = (id) => {
    if (!window.confirm('Are you sure to proceed?')) return;

    const updatedBookList = bookList.map((book) => {
      if (book.id === id) {
        return { ...book, availability: !book.availability };
      }
      return book;
    });

    axios
      .put(api_url + `/${id}`, updatedBookList.find((book) => book.id === id))
      .then(() => {
        setBookList(updatedBookList);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const removeBook = (id) => {
    if (!window.confirm('Are you sure to delete the entry?')) return;

    axios
      .delete(api_url + `/${id}`)
      .then(() => {
        setBookList((prevList) => prevList.filter((book) => book.id !== id));
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const editBook = (id) => {
    const bookToEdit = bookList.find((book) => book.id === id);
    formik.setValues({
      id: bookToEdit.id,
      bookName: bookToEdit.bookName,
      authorName: bookToEdit.authorName,
      availability: bookToEdit.availability,
      date: bookToEdit.date
    });

  };

  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase().trim();
    if (searchValue === '') {
      setFilteredBookList([]);
    } else {
      axios
        .get(api_url + `?q=${searchValue}`)
        .then((res) => {
          setFilteredBookList(res.data);
        })
        .catch((err) => {
          console.log('Error:', err);
        });
    }
  };

  const filterAuthor = (e) => {
    console.log(e.target.value)
    setSelectedAuthor(e.target.value)
    const searchAuthor = e.target.value.toLowerCase().trim();
    const searchDate = selectedDate || undefined;
  
    axios
      .get(api_url, {
        params: {
          authorName: searchAuthor,
          date: searchDate
        }
      })
      .then((res) => {
        setFilteredBookList(res.data);
      })
      .catch((err) => {
        console.log('Error:', err);
      });
  };
  
  const filterDate = (e) => {
    const searchDate = e.target.value;
    setSelectedDate(searchDate)
    const searchAuthor = selectedAuthor || undefined;
  
    axios
      .get(api_url, {
        params: {
          authorName: searchAuthor,
          date: searchDate
        }
      })
      .then((res) => {
        setFilteredBookList(res.data);
      })
      .catch((err) => {
        console.log('Error:', err);
      });
  };  

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'return') {
      e.target.blur();
    }
  }

  return (
    <div>
      <Typography variant="h2">
        <span className="head">Book management</span>
      </Typography>
      <div className="form-container">
        <form onSubmit={formik.handleSubmit}>
          <div className="form-element">
            <TextField
              type="text"
              id="bookName"
              name="bookName"
              label="Book Name"
              className="textbox"
              value={formik.values.bookName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}error={formik.touched.bookName && Boolean(formik.errors.bookName)}
              helperText={formik.touched.bookName && formik.errors.bookName}            
            />
          </div>
          <TextField
            type="text"
            id="authorName"
            name="authorName"
            label="Author Name"
            className="textbox"
            value={formik.values.authorName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <TextField
            type="date"
            id="date"
            name="date"
            label="publishDate"
            className="textbox"
            value={formik.values.date}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.date && Boolean(formik.errors.date)}
            helperText={formik.touched.date && formik.errors.date}          
          />
          <br />
          <br />
          <Button type="submit" variant="contained" className="buttonSubmit">
            {formik.values.id ? 'Update Book' : 'Add Book'}
          </Button>
        </form>
      </div>
      <div className="search-container">
        <TextField variant="standard" type="text" label="Search Books" placeholder="Search Books" onChange={handleSearch} />
      </div>
      <div className="filter-container">
        <InputLabel htmlFor="filter-by-date">Filter By Date</InputLabel>
          <TextField
          variant='standard'
          type="date"
          id='filter-by-date'
          name='filter-by-date'
          // value={formik.values.date}
          onChange={filterDate}
          onKeyDown={handleKeyDown}
        />
        <InputLabel htmlFor="filter-by-author">Filter By Author</InputLabel>
        <Select
          variant="standard"
          id="filter-by-author"
          name="filter-by-author"
          value={selectedAuthor || ''}
          onChange={filterAuthor}
          onBlur={filterAuthor}
        >
          <MenuItem value=''>All Authors</MenuItem>
          {uniqueAuthors.map((author) => (
            <MenuItem key={author} value={author}>
              {author}
            </MenuItem>
          ))}
        </Select>
      </div>
      {bookList.length > 0 && (
        <div className="table-container">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Book</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Availability</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBookList.length > 0
                ? filteredBookList.map((book) => (
                  book.bookName !== '' && (
                    <TableRow key={book.id}>
                      <TableCell>{book.bookName}</TableCell>
                      <TableCell>{book.authorName}</TableCell>
                      <TableCell>
                        <div className="button-container">
                          <Button
                            className={book.availability ? 'available' : 'not-available'}
                            onClick={() => toggleAvailability(book.id)}
                          >
                            {book.availability ? 'Available' : 'Not Available'}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                      <IconButton onClick={() => removeBook(book.id)}>
                        <Delete className='delete-button'/>
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => editBook(book.if)}>
                        <Edit className='edit-button'/>
                      </IconButton>
                    </TableCell>
                    </TableRow>
                  )
                ))
                : bookList.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell>{book.bookName}</TableCell>
                    <TableCell>{book.authorName}</TableCell>
                    <TableCell>
                      <div className="button-container">
                        <Button
                          variant='contained'
                          className={book.availability ? 'available' : 'not-available'}
                          onClick={() => toggleAvailability(book.id)}
                        >
                          {book.availability ? 'Available' : 'Not Available'}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => removeBook(book.id)}>
                        <Delete className='delete-button'/>
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <><IconButton onClick={() => editBook(book.if)}>
                        <Edit className='edit-button'/>
                      </IconButton></>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default FormApi_npm;