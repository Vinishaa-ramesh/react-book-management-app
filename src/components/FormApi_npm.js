import React, { useState, useEffect } from 'react';
import { Typography, TextField, Button, Table, TableHead, TableBody, TableRow, TableCell, InputLabel, Select, MenuItem, Dialog, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { Delete, Edit, Search, LocalLibrary, Refresh} from '@material-ui/icons';
import { useFormik } from 'formik';
import axios from 'axios';
import './newForm.css';
// import { searchSpace } from './HeaderSpace'

function FormApi_npm() {
  const api_url = 'http://localhost:3000/books';
  const [bookList, setBookList] = useState([]);
  const [filteredBookList, setFilteredBookList] = useState([]);

  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchValue, setSearchValue] = useState('')

  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState('');

  const [toggleDialog, setToggleDialog] = useState(false)
  const [toggleBookId, setToggleBookId] = useState('')

  const [bookNotFound, setBookNotFound] = useState(false)

  const [authorChangeDialog, setAuthorChangeDialog] = useState(false)
  const [authorReplace, setAuthorReplace] = useState('')


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

      //check if book name is already present
      const checkBookName = bookList.filter((book) => {
        const bookName = book.bookName.toLowerCase();
        return values.bookName.toLowerCase() === bookName;
      });

      // edit mode
      if (values.id){
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
      } 
      
      // new book
      else {
        if (checkBookName.length !== 0) {
          // book present without author name
          if (!checkBookName[0].authorName.toLowerCase().localeCompare('n/a')) {
            setAuthorChangeDialog(true)
            setAuthorReplace(checkBookName[0].id)
            return;
          } 
          // book already present
          else {
            alert('Book already present');
            resetForm();
            return;
          }
        }
    
        //add new book
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

      //make bookname and date required fields

      if (!values.bookName) {
        errors.bookName = '*required';
      }

      if (!values.date) {
        errors.date = '*select date';
      }
      return errors;
    }
  });


  //replace author function

  const handleAuthorChangeClose = () => {
    setAuthorChangeDialog(false)
    formik.resetForm()
  }

  const handleAuthorChangeConfirm = () => {
    setAuthorChangeDialog(false)
      axios
        .put(api_url + `/${authorReplace}`, {
          bookName: formik.values.bookName,
          authorName: formik.values.authorName ? formik.values.authorName : 'N/A',
          availability: formik.values.availability,
          date: formik.values.date
        })
        .then((res) => {
          fetchBooks();
          formik.resetForm();
          setAuthorReplace(false)
        })
        .catch((error) => {
          console.log('Error: ' + error);
        });
  }

  //toggle functionality

  const handleToggleCancel = () => {
    setToggleDialog(false)
  }

  const handleToggleClick = (id) => {
    setToggleDialog(true)
    setToggleBookId(id)
  }
  const toggleAvailability = () => {

    const updatedBookList = bookList.map((book) => {
      if (book.id === toggleBookId) {
        return { ...book, availability: !book.availability };
      }
      return book;
    });

    axios
      .put(api_url + `/${toggleBookId}`, updatedBookList.find((book) => book.id === toggleBookId))
      .then(() => {
        setBookList(updatedBookList);
        // filterAuthor();
        setToggleDialog(false)
        setToggleBookId('')
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };


  // end of toggle functionality


  // delete book functionality

  const removeBook = (id) => {
    setSelectedBookId(id);
    setDeleteConfirmationOpen(true);
  };

  const handleDeleteConfirmation = () => {
    axios
      .delete(api_url + `/${selectedBookId}`)
      .then(() => {
        setBookList((prevList) => prevList.filter((book) => book.id !== selectedBookId));
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    setDeleteConfirmationOpen(false);
    setSelectedBookId('')
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmationOpen(false);
    setSelectedBookId('')
  };

  // end of delete book functionality

  // edit book functionality

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

  // end of edit book functionality

  // global search

  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase().trim();
    // console.log("in search", searchSpace)
    setSearchValue(e.target.value)
    if (searchValue === '') {
      setFilteredBookList([]);
    } else {
      axios
        .get(api_url + `?q=${searchValue}`)
        .then((res) => {
          setFilteredBookList(res.data);
          if(res.data.length===0 && e.type=='blur'){
            setBookNotFound(true)
            setSearchValue('')
          }
        })
        .catch((err) => {
          console.log('Error:', err);
        });
    }
  };

  // filter using author name

  const filterAuthor = (e) => {
    console.log(e.target.value)
    setSelectedAuthor(e.target.value)
    const searchAuthor = e.target.value;
    const searchDate = selectedDate || undefined;
  
    axios
      .get(api_url, {
        params: {
          authorName: searchAuthor,
          date: searchDate
        }
      })
      .then((res) => {
        console.log(res)
        setFilteredBookList(res.data);
        if(res.data.length===0 && searchAuthor) setBookNotFound(true)
      })
      .catch((err) => {
        console.log('Error:', err);
      });
  };
  
  //filter using publish date

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
        if(res.data.length===0) setBookNotFound(true)
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

  // when clear filter button is clicked

  const clearFilter = () => {
    setSelectedAuthor('')
    setSelectedDate(null)
  }

  // when book not found in filter method
  const handleBookNotFoundClose = () => {
    setBookNotFound(false)
    clearFilter()
  }
  return (
    <div className='main-container'>
      {/* title bar */}
      <div className='title-bar'>
        <LocalLibrary fontSize='large'/>
        <Typography variant="h2">
          <span className="head">Book management</span>
        </Typography>
        <div className="search-container">
            <Search/>
            <TextField 
            variant="standard" 
            type="text" 
            sx={{borderBottom: 1}}
            placeholder="Search Books..."
            onKeyDown={handleKeyDown}
            onBlur={handleSearch}
            onChange={handleSearch} />
        </div>
      </div>
      {/* form to add book */}
      <div className="form-container">
        <form onSubmit={formik.handleSubmit}>
          <div className="form-element">
            <TextField
              type="text"
              id="bookName"
              name="bookName"
              label="Book Name"
              className="textbox"
              placeholder='Enter Book name...'
              value={formik.values.bookName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}error={formik.touched.bookName && Boolean(formik.errors.bookName)}
              helperText={formik.touched.bookName && formik.errors.bookName} 
              InputLabelProps={ {shrink: true} }                
            />
          </div>
          <TextField
            type="text"
            id="authorName"
            name="authorName"
            label="Author Name"
            className="textbox"
            placeholder='Enter Author name...'
            value={formik.values.authorName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            InputLabelProps={ {shrink: true} }     
          />
              <TextField
                id="date"
                name="date"
                label="publishDate"
                type="date"
                className="textbox"
                value={formik.values.date || null}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.date && Boolean(formik.errors.date)}
                helperText={formik.touched.date && formik.errors.date}
                InputLabelProps={ {shrink: true} }         
              />
          <br />
          <br />
          <Button type="submit" variant="contained" className="buttonSubmit">
            {formik.values.id ? 'Update Book' : 'Add Book'}
          </Button>
        </form>
      </div>

      {/* author replace dialog */}
      <Dialog aria-describedby='author-change'
                open={authorChangeDialog}
                onClose={handleAuthorChangeClose}>
                <DialogContent>
                  <DialogContentText id='author-change'>
                    Book title found without author. Replace Author name?
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleAuthorChangeClose}>No</Button>
                  <Button onClick={handleAuthorChangeConfirm}>Yes</Button>
                </DialogActions>
              </Dialog>

      {/* filter options */}
      <div className="filter-container">
        <InputLabel htmlFor="filter-by-date">Filter By Date</InputLabel>
          <TextField
          type="date"
          id='filter-by-date'
          name='filter-by-date'
          value={selectedDate || ''}
          onChange={filterDate}
          onBlur={filterDate}
          onKeyDown={handleKeyDown}
        />
        <InputLabel htmlFor="filter-by-author">Filter By Author</InputLabel>
        <Select
          id="filter-by-author"
          name="filter-by-author"
          className='drop-down-author'
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
        <Button  onClick={clearFilter}>
        <Refresh/>
          </Button>
      </div>

      {/* table to display books */}
      {bookList.length > 0 && (
        <div className="table-container">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Book</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Publish Date</TableCell>
                <TableCell>Availability</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* when filter is applied */}
              {filteredBookList.length > 0 && (selectedAuthor || selectedDate || searchValue) ? 
              filteredBookList.map((book) => (
                  book.bookName !== '' && (
                    <TableRow key={book.id}>
                      <TableCell>{book.bookName}</TableCell>
                      <TableCell>{book.authorName}</TableCell>
                      <TableCell>{book.date}</TableCell>
                      <TableCell>
                        <div className="button-container">
                          <Button
                            className={book.availability ? 'available' : 'not-available'}
                            onClick={() => handleToggleClick(book.id)}
                          >
                            {book.availability ? 'Available' : 'Not Available'}
                          </Button>
                        </div>
                        {/* when toggle button is clicked */}
                        {toggleDialog && (
                          <Dialog aria-describedby='toggle-dialog-text'
                            open={toggleDialog}
                            onClose={handleToggleCancel}>
                            <DialogContent>
                            <DialogContentText id='toggle-dialog-text'>
                              Do you want to proceed?
                            </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                              <Button onClick={handleToggleCancel}>Cancel</Button>
                              <Button onClick={toggleAvailability}>Confirm</Button>
                            </DialogActions>
                          </Dialog>
                        )}
                      </TableCell>
                      <TableCell>
                      {selectedBookId!=book.id && <div><div onClick={() => removeBook(book.id)}>
                        <Delete className='delete-button'/>
                      </div>
                      </div>}
                      {/* when delete button is clicked */}
                      {deleteConfirmationOpen && selectedBookId==book.id && (
                      <Dialog
                        open={deleteConfirmationOpen}
                        onClose={handleDeleteCancel}
                        aria-describedby='delete-dialog-description'
                        sx={{minWidth: 500,}}
                      >
                        <DialogContent>
                          <DialogContentText id="delete-dialog-description">
                            Confirm delete?
                          </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                          <Button onClick={handleDeleteCancel}>Cancel</Button>
                          <Button onClick={handleDeleteConfirmation} autoFocus>
                            Delete
                          </Button>
                        </DialogActions>
                      </Dialog>
                      )}
                    </TableCell>
                    <TableCell>
                      <div onClick={() => editBook(book.id)}>
                        <Edit className='edit-button'/>
                      </div>
                    </TableCell>
                    </TableRow>
                )))

                // default condition - display all books

                : bookList.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell>{book.bookName}</TableCell>
                    <TableCell>{book.authorName}</TableCell>
                      <TableCell>{book.date}</TableCell>
                    <TableCell>
                      <div className="button-container">
                        <Button
                          variant='contained'
                          className={book.availability ? 'available' : 'not-available'}
                          onClick={() => handleToggleClick(book.id)}
                        >
                          {book.availability ? 'Available' : 'Not Available'}
                        </Button>
                      </div>
                      {toggleDialog && (
                          <Dialog aria-describedby='toggle-dialog-text'
                            open={toggleDialog}
                            onClose={handleToggleCancel}>
                            <DialogContent>
                            <DialogContentText id='toggle-dialog-text'>
                              Do you want to proceed?
                            </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                              <Button onClick={handleToggleCancel}>Cancel</Button>
                              <Button onClick={toggleAvailability}>Confirm</Button>
                            </DialogActions>
                          </Dialog>
                        )}
                    </TableCell>
                    <TableCell className='button-cell'>
                      {selectedBookId!=book.id && 
                      <div>
                        <div
                        className="delete-button"
                        onClick={() => removeBook(book.id)}
                        size = "small"
                      >
                        <Delete/>
                      </div>
                      </div>}
                      {deleteConfirmationOpen && selectedBookId==book.id && (
                          <Dialog
                            open={deleteConfirmationOpen}
                            onClose={handleDeleteCancel}
                            aria-describedby='delete-dialog-description'
                            sx={{minWidth: 500,}}
                          >
                            <DialogContent>
                              <DialogContentText id="delete-dialog-description">
                                Confirm delete?
                              </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                              <Button onClick={handleDeleteCancel}>Cancel</Button>
                              <Button onClick={handleDeleteConfirmation} autoFocus>
                                Delete
                              </Button>
                            </DialogActions>
                          </Dialog>
                        )}
                    </TableCell>
                    <TableCell className='button-cell'>
                    <div
                        className="edit-button"
                        onClick={() => editBook(book.id)}
                        size = 'small'
                      >
                        <Edit/>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}
        {/* book not found dialog */}
        <Dialog open={bookNotFound} onClose={handleBookNotFoundClose}>
          <DialogContent>
            <DialogContentText>
              No Book Found!
            </DialogContentText>
          </DialogContent>
        </Dialog>
    </div>
  );
}

export default FormApi_npm;
