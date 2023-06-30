import React, {useState} from 'react';
import { useEffect } from 'react';
// import './Form.css'
import './newForm.css'
import { Typography, TextField, Button, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';

function Form(){
    const [formData, setFormData] = useState({
        bookName: '',
        authorName: '',
        availability: true
    });

    const [bookList, setBookList] = useState(() => {
      const localBookList = localStorage.getItem('bookList');
      return localBookList ? JSON.parse(localBookList) : [];
    });
    // const [bookList, setBookList] = useState([])

    const [filteredBookList, setFilteredBookList] = useState([]);

    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
      localStorage.setItem('bookList', JSON.stringify(bookList));
    }, [bookList]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevFormData) => ({
          ...prevFormData,
          [id]: value
        }));
    }

    const addBook = (e) => {
        e.preventDefault()
        if(formData.bookName.trim()=='') return;
        let authName = formData.authorName.trim();
        if(authName===''){
          authName = 'N/A'
        }
        const checkBookName = bookList.filter((book) => {
          const bookName = book.bookName.toLowerCase()
          const authorName = book.authorName.toLowerCase()
          return (formData.bookName.toLowerCase()==bookName && authName.toLowerCase()==authorName)
        })
        // console.log(checkBookName)
        // console.log(bookList)
        if(checkBookName.length!=0){
          alert("Book already present");
          setFormData({bookName:'',authorName:'',availability:true})
          return;
        }
        const newBook = {
            bookName: formData.bookName,
            authorName: authName,
            availability: formData.availability
        }
        setBookList((prevList) => [...prevList, newBook])
        setFormData({bookName:'',authorName:'',availability:true})
        setEditMode(0);
    }

    const toggleAvailability = (index) => {
      console.log("-");
        if(!window.confirm("Are you sure to proceed?")) return;
        setBookList((prevList) => {
          const updatedList = [...prevList];
          const updatedBook = {...updatedList[index]};
          updatedBook.availability = !updatedBook.availability;
          updatedList[index] = updatedBook;
          return updatedList;
        });
      }

      const removeBook = (index) => {
        if(!window.confirm("Are you sure to delete entry?")) return;
        setBookList((prevList) => {
          const updatedList = [...prevList];
          updatedList.splice(index, 1);
          return updatedList;
        });
      }
      const editBook = (index) => {
        setEditMode(1)
        const bookToEdit = bookList[index];
        setFormData({
          bookName: bookToEdit.bookName,
          authorName: bookToEdit.authorName,
          availability: bookToEdit.availability
        });
        const updatedList = [...bookList];
        updatedList.splice(index, 1);
        setBookList(updatedList);
      };
      
      const handleSearch = (e) => {
        console.log(filteredBookList);
        const searchValue = e.target.value.toLowerCase().trim();
        if (searchValue == '') {
          setFilteredBookList([]);
        } else {
          const filteredList = bookList.filter((book) => {
            const bookName = book.bookName.toLowerCase().trim();
            const authorName = book.authorName.toLowerCase().trim();
            return bookName.includes(searchValue) || authorName.includes(searchValue);
          });
          if(filteredList.length==0) setFilteredBookList([{ bookName: '', authorName: '' }]);
          else setFilteredBookList(filteredList);
        }
      };
      

      return (
        <div>
        <Typography variant="h2">Book management</Typography>
        <div className="form-container">
          <form onSubmit={addBook}>
            <TextField
              type="text"
              id="bookName"
              label="Book Name"
              className="textbox"
              value={formData.bookName}
              onChange={handleChange}
            />
            <br /><br />
            <TextField
              type="text"
              id="authorName"
              label="Author Name"
              className="textbox"
              value={formData.authorName}
              onChange={handleChange}
            />
            <br /><br />
            <Button type="submit" variant="contained" className="buttonSubmit">
              {editMode === 1 ? 'Update Book' : 'Add Book'}
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
                              className="delete-button"
                              onClick={() => removeBook(index)}
                            >
                              X
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Button
                              className="edit-button"
                              onClick={() => editBook(index)}
                            >
                              /
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
                    ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      );      
}

export default Form