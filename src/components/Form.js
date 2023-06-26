import React, {useState} from 'react';
import './Form.css'

function Form(){
    const [formData, setFormData] = useState({
        bookName: '',
        authorName: '',
        availability: true
    });

    const [bookList, setBookList] = useState([])

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevFormData) => ({
          ...prevFormData,
          [id]: value
        }));
    }

    const addBook = (e) => {
        console.log(formData.bookName)
        console.log(formData.authorName)
        console.log(formData.availability)
        e.preventDefault()
        const newBook = {
            bookName: formData.bookName,
            authorName: formData.authorName,
            availability: formData.availability
        }
        setBookList((prevList) => [...prevList, newBook])
        setFormData({bookName:'',authorName:'',availability:true})
    }

    const toggleAvailability = (index) => {
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
        const bookToEdit = bookList[index];
        const updatedBook =  {...bookToEdit};
        const newBookName = window.prompt('Enter the new book name:', updatedBook.bookName);
        const newAuthorName = window.prompt('Enter the new author name:', updatedBook.authorName);
        if (newBookName !== null) {
          updatedBook.bookName = newBookName;
        }
        if (newAuthorName !== null) {
          updatedBook.authorName = newAuthorName;
        }
        setBookList((prevList) => {
          const updatedList = [...prevList];
          updatedList[index] = updatedBook;
          return updatedList;
        })
      }
      
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
              <button type="submit" className='buttonSubmit'>Add Book</button>
            </form>
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
                  {bookList.map((book, index) => (
                    <tr key={index}>
                      <td>{book.bookName}</td>
                      <td>{book.authorName}</td>
                      <td>
                        <div className="button-container">
                          <button className={book.availability ? "available" : "not-available"} onClick={() => toggleAvailability(index)}>
                            {book.availability ? 'Available' : 'Not Available'}
                          </button>
                        </div>
                      </td>
                      <td>
                        <button className='delete-button' onClick={() => removeBook(index)}>
                            X
                        </button>
                      </td>
                      <td>
                        <button className='edit-button' onClick={() => editBook(index)}>
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