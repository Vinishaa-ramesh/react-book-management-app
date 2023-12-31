import React, { useState } from 'react';
import { useEffect } from 'react';
import { Typography, TextField, Button, Table, TableHead, TableBody, TableRow, TableCell, InputLabel, Select, MenuItem } from '@mui/material';
import { IconButton } from '@material-ui/core';
import { Delete, Edit } from '@material-ui/icons';
import { useFormik } from 'formik';
import './newForm.css'

function Form() {
  const [bookList, setBookList] = useState(() => {
    const localBookList = localStorage.getItem('bookList');
    return localBookList ? JSON.parse(localBookList) : [];
  });

  const [filteredBookList, setFilteredBookList] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [uniqueAuthors, setUniqueAuthors] = useState([]);
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    localStorage.setItem('bookList', JSON.stringify(bookList));
  }, [bookList]);

  useEffect(() => {
    const authors = [...new Set(bookList.map((book) => book.authorName))];
    setUniqueAuthors(authors);
  }, [bookList]);

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
        const authorName = book.authorName.toLowerCase();
        return (
          values.bookName.toLowerCase() === bookName
        );
      });
      if (checkBookName.length !== 0) {
          if (!checkBookName[0].authorName.toLowerCase().localeCompare('n/a')) {
            if(window.confirm('Replace author name?')){
                const newBook = {
                  bookName: values.bookName,
                  authorName: (values.authorName) ? values.authorName : 'N/A',
                  availability: values.availability,
                  date: editMode ? values.date : new Date().toDateString()
                };
                setBookList((prevList) => {
                  const updatedList = prevList.filter((book) => {
                    return (
                      book.bookName.toLowerCase() !== checkBookName[0].bookName.toLowerCase()
                    );
                  });
                  return [...updatedList, newBook];
                });
                resetForm();
                return;
            }
            else{
              resetForm();
              return;
            }
          }
        else{
          alert('Book already present');
          resetForm();
          return;
        }
      }
      console.log("here"+values.date)
      
      const newBook = {
        bookName: values.bookName,
        authorName: (values.authorName) ? values.authorName : 'N/A',
        availability: values.availability,
        date: editMode ? values.date : new Date().toDateString()
      };
      setBookList((prevList) => [...prevList, newBook]);
      resetForm();
      setEditMode(false);
    },
    validate: values => {
      let errors = {}

      if(!values.bookName){
        errors.bookName = '*required'
      }
      // if (!values.authorName && formik.touched.authorName) {
      //   values.authorName = 'N/A';
      // }
      return errors
    }
  });

  const toggleAvailability = (index) => {
    if (!window.confirm('Are you sure to proceed?')) return;
    setBookList((prevList) => {
      const updatedList = [...prevList];
      const updatedBook = { ...updatedList[index] };
      updatedBook.availability = !updatedBook.availability;
      updatedList[index] = updatedBook;
      return updatedList;
    });
  };

  const removeBook = (index) => {
    if (!window.confirm('Are you sure to delete entry?')) return;
    setBookList((prevList) => {
      const updatedList = [...prevList];
      updatedList.splice(index, 1);
      return updatedList;
    });
  };

  const editBook = (index) => {
    setEditMode(true);
    const bookToEdit = bookList[index];
    formik.setValues({
      bookName: bookToEdit.bookName,
      authorName: bookToEdit.authorName,
      availability: bookToEdit.availability,
      date: bookToEdit.date
    });
    const updatedList = [...bookList];
    updatedList.splice(index, 1);
    setBookList(updatedList);
  };

  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase().trim();
    if (searchValue === '') {
      setFilteredBookList([]);
    } else {
      const filteredList = bookList.filter((book) => {
        const bookName = book.bookName.toLowerCase().trim();
        const authorName = book.authorName.toLowerCase().trim();
        return bookName.includes(searchValue) || authorName.includes(searchValue);
      });
      if (filteredList.length === 0) setFilteredBookList([{ bookName: '', authorName: '' }]);
      else setFilteredBookList(filteredList);
    }
  };

  const filterAuthor = (e) => {
    setSelectedAuthor(e.target.value);
    const searchAuthor = e.target.value.toLowerCase().trim();
    const searchDate = selectedDate ? new Date(selectedDate) : null;
  
    const filteredBooks = bookList.filter((book) => {
      const authorName = book.authorName.toLowerCase();
      const bookDate = new Date(book.date);
      return (
        (!searchAuthor || !searchAuthor.localeCompare('all authors') || authorName.includes(searchAuthor)) &&
        (!searchDate ||
          (bookDate.getDate() === searchDate.getDate() &&
            bookDate.getMonth() === searchDate.getMonth() &&
            bookDate.getFullYear() === searchDate.getFullYear()))
      );
    });
  
    if (filteredBooks.length === 0) {
      setFilteredBookList([{ bookName: '', authorName: '' }]);
    } else {
      setFilteredBookList(filteredBooks);
    }
  };
  
  const filterDate = (e) => {
    setSelectedDate(e.target.value);
    const searchDate = e.target.value ? new Date(e.target.value) : null;
    const searchAuthor = selectedAuthor.toLowerCase().trim();
  
    const filteredBooks = bookList.filter((book) => {
      const authorName = book.authorName.toLowerCase()
      const bookDate = new Date(book.date);
      return (
        (!searchAuthor || !searchAuthor.localeCompare('all authors') || authorName.includes(searchAuthor)) &&
        (!searchDate ||
          (bookDate.getDate() === searchDate.getDate() &&
            bookDate.getMonth() === searchDate.getMonth() &&
            bookDate.getFullYear() === searchDate.getFullYear()))
      );
    });
  
    if (filteredBooks.length === 0) {
      setFilteredBookList([{ bookName: '', authorName: '' }]);
    } else {
      setFilteredBookList(filteredBooks);
    }
  };
  

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'return') {
      e.target.blur();
    }
  }

  return (
    <div>
      <Typography variant="h2"><span className='head'>Book management</span></Typography>
      <div className="form-container">
        <form onSubmit={formik.handleSubmit}>
        <div className='form-element'>
          <TextField
            type="text"
            id="bookName"
            name="bookName"
            label="Book Name"
            className="textbox"
            value={formik.values.bookName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.errors.bookName && formik.touched.bookName && (
            <div className='error'>{formik.errors.bookName}</div>
          )}
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
          <br /><br />
          <Button type="submit" variant="contained" className="buttonSubmit">
            {editMode ? 'Update Book' : 'Add Book'}
          </Button>
        </form>
      </div>
      <div className="search-container">
        <TextField
          variant='standard'
          type="text"
          label="Search Books"
          placeholder="Search Books"
          onChange={handleSearch}
        />
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
          value={selectedAuthor || 'All Authors'}
          onChange={filterAuthor}
          onBlur={filterAuthor}
        >
          <MenuItem value="All Authors">All Authors</MenuItem>
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
                ? filteredBookList.map((book, index) => (
                  book.bookName !== '' && (
                    <TableRow key={index}>
                      <TableCell>{book.bookName}</TableCell>
                      <TableCell>{book.authorName}</TableCell>
                      <TableCell>
                        <div className="button-container">
                          <Button
                            className={book.availability ? 'available' : 'not-available'}
                            onClick={() => toggleAvailability(index)}
                          >
                            {book.availability ? 'Available' : 'Not Available'}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant='text'
                          className="delete-button"
                          onClick={() => removeBook(index)}
                        >
                          delete
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant='text'
                          className="edit-button"
                          onClick={() => editBook(index)}
                        >
                          edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                ))
                : bookList.map((book, index) => (
                  <TableRow key={index}>
                    <TableCell>{book.bookName}</TableCell>
                    <TableCell>{book.authorName}</TableCell>
                    <TableCell>
                      <div className="button-container">
                        <Button
                          variant='contained'
                          className={book.availability ? 'available' : 'not-available'}
                          onClick={() => toggleAvailability(index)}
                        >
                          {book.availability ? 'Available' : 'Not Available'}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {/* <Button
                        variant='text'
                        className="delete-button"
                        onClick={() => removeBook(index)}
                      >
                        delete
                      </Button> */}
                      <IconButton onClick={() => removeBook(index)}>
                        <Delete className='delete-button'/>
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      {/* <Button
                        variant='text'
                        className="edit-button"
                        onClick={() => editBook(index)}
                      >
                        edit
                      </Button> */}
                      <IconButton onClick={() => editBook(index)}>
                        <Edit className='edit-button'/>
                      </IconButton>
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

export default Form;
