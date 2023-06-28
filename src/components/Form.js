import React, {useState} from 'react';
import { useEffect } from 'react';
import './Form.css'

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
        if(formData.bookName.trim()==''||formData.authorName.trim()=='') return;
        const checkBookName = bookList.filter((book) => {
          const bookName = book.bookName.toLowerCase()
          const authorName = book.authorName.toLowerCase()
          return (formData.bookName.toLowerCase()==bookName && formData.authorName.toLowerCase()==authorName)
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
            authorName: formData.authorName,
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
          <div className="form-container">
            <form onSubmit={addBook}>
              <label htmlFor="bookName">Book Name{' '}</label>
              <input
                type="text"
                id="bookName"
                className='textbox'
                value={formData.bookName}
                onChange={handleChange}
              />
              <br/><br/>
              <label htmlFor='authorName'>Author Name{' '}</label>
              <input
                type="text"
                id="authorName"
                className='textbox'
                value={formData.authorName}
                onChange={handleChange}
              />
              <br/><br/>
              <button type="submit" className='buttonSubmit'>
                {editMode == 1 ? 'Update Book' : 'Add Book'}
              </button>
            </form>
          </div>
          <div className="search-container">
            <input type="text" placeholder="Search Books" onChange={handleSearch} />
          </div>
          {bookList.length > 0 && (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Book</th>
                    <th>Author</th>
                    <th>Availability</th>
                    <th></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
            {filteredBookList.length > 0
              ? filteredBookList.map((book, index) => (
                  (book.bookName!='' && <tr key={index}>
                    <td>{book.bookName}</td>
                    <td>{book.authorName}</td>
                    <td>
                      <div className="button-container">
                        <button
                          className={book.availability ? 'available' : 'not-available'}
                          onClick={() => toggleAvailability(index)}
                        >
                          {book.availability ? 'Available' : 'Not Available'}
                        </button>
                      </div>
                    </td>
                    <td>
                      <button className="delete-button" onClick={() => removeBook(index)}>
                        X
                      </button>
                    </td>
                    <td>
                      <button className="edit-button" onClick={() => editBook(index)}>
                        /
                      </button>
                    </td>
                  </tr>
                )))
              : bookList.map((book, index) => (
                  <tr key={index}>
                    <td>{book.bookName}</td>
                    <td>{book.authorName}</td>
                    <td>
                      <div className="button-container">
                        <button
                          className={book.availability ? 'available' : 'not-available'}
                          onClick={() => toggleAvailability(index)}
                        >
                          {book.availability ? 'Available' : 'Not Available'}
                        </button>
                      </div>
                    </td>
                    <td>
                      <button className="delete-button" onClick={() => removeBook(index)}>
                        X
                      </button>
                    </td>
                    <td>
                      <button className="edit-button" onClick={() => editBook(index)}>
                        /
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
              </table>
            </div>
          )}
        </div>
      );      
}

export default Form