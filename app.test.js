const request = require("supertest");
const app = require("./app");
const db = require("./db");
const Book = require("./models/book");
const { DB_URI } = require("./config");

process.env.NODE_ENV = "test";

let isbn = "0691161518";

describe("Book  Test", function () {

    beforeEach(async function () {
        await db.query("DELETE FROM books-test");

        await Book.create({
            isbn: "0691161518",
            amazon_url: "http://a.co/eobPtX2",
            author: "Matthew Lane",
            language: "english",
            pages: 264,
            publisher: "Princeton University Press",
            title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            year: 2017
        });

        isbn = "0691161518";
    });

    afterEach(async function(){
        await db.query("DELETE FROM books-test");
    });

    /** GET / => {books: [book, ...]}  */
    describe("GET /books", function () {
        test("returns info for all books", async function () {
            const response = await request(app)
                .get("/books");
        
            console.log("response.body in GET/books: ", response.body);
            // ISSUE: we are not clearing our database after each test

            expect(response.body).toEqual({
                books: [{
                    isbn: "0691161518",
                    amazon_url: "http://a.co/eobPtX2",
                    author: "Matthew Lane",
                    language: "english",
                    pages: 264,
                    publisher: "Princeton University Press",
                    title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
                    year: 2017
                }]
            });
        });
    });

    /** GET /[id]  => {book: book} */
    describe("GET /books/:id", function () {
        test("returns info for requested book IF book exists", async function () {
            // check response
            const response = await request(app)
                .get(`/books/${isbn}`)

            expect(response.body).toEqual({
                book: {
                    isbn: "0691161518",
                    amazon_url: "http://a.co/eobPtX2",
                    author: "Matthew Lane",
                    language: "english",
                    pages: 264,
                    publisher: "Princeton University Press",
                    title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
                    year: 2017
                }
            });
        });


        test("returns error if requested book does NOT exist", async function () {
            // check error message: {message: `There is no book with an isbn '${isbn}`}
            // check status: 404
            const response = await request(app)
                .get(`/books/128973982174981273987128937`)
            expect(response.statusCode).toEqual(404);
            expect(response.body.error).toEqual({ "message": `There is no book with an isbn '128973982174981273987128937`, "status": 404 });
        });
    });


    // QUESTION: what happens if folks enter the title instead of the isbn? will the error test catch it? 

    /** POST /   bookData => {book: newBook}  */
    describe("POST /books", function () {

        test("adds book if valid info is provided", async function () {
            // test that data was added to db (use get/ , check that results.rows.length === 1)
            // check response
            const resp = await request(app)
                .post("/books")
                .send({
                    isbn: "123123123",
                    amazon_url: "http://joannesbooks.com/amazingbookadventure",
                    author: "Test",
                    language: "english",
                    pages: 233,
                    publisher: "Test Publisher",
                    title: "Testing Title of the Testersons",
                    year: 2016
                });
            expect(response.statusCode).toEqual(201);
            expect(response.body).toEqual({
                book: {
                    isbn: "123123123",
                    amazon_url: "http://joannesbooks.com/amazingbookadventure",
                    author: "Test",
                    language: "english",
                    pages: 233,
                    publisher: "Test Publisher",
                    title: "Testing Title of the Testersons",
                    year: 2016
                }
            });

            const getBookResponse = await request(app).get('/books/123123123')
            expect(response.body[0]).toEqual({
                book: {
                    isbn: "123123123",
                    amazon_url: "http://joannesbooks.com/amazingbookadventure",
                    author: "Test",
                    language: "english",
                    pages: 233,
                    publisher: "Test Publisher",
                    title: "Testing Title of the Testersons",
                    year: 2016
                }
            });
            expect(response.body).toHaveLength(1);
        });

        // QUESTION: should we make another test for empty string inputs?
        test("throws error if invalid data is provided", async function () {
            // test for error message
            // test that data was NOT added to db (use get/ check that result.rows.length === 0)
            const resp = await request(app)
                .post("/books")
                .send({
                    isbn: "dlsjafo13jr09",
                    amazon_url: "FAKEURL",
                    author: 1,
                    language: 1,
                    publisher: 12039481203123,
                    title: 123123,
                    year: "sadflkjsdflkjsdlfkj"
                });
            expect(response.statusCode).toEqual(400);
            expect(response.body.error).toEqual(`TODO: FIX THIS EQUAL SILLY`)
        });

        test("throws error if user tries to add a book that already exists", async function () {
            // test for error message re: primary key
            const resp = await request(app)
                .post("/books")
                .send({
                    isbn: "0691161518",
                    amazon_url: "http://a.co/eobPtX2",
                    author: "Matthew Lane",
                    language: "english",
                    pages: 264,
                    publisher: "Princeton University Press",
                    title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
                    year: 2017
                });
            expect(response.statusCode).toEqual(400);
            expect(response.body.error).toEqual(`TODO: FIX THIS ERROR MESSAGE`)            
        });
    });


    /** PUT /[isbn]   bookData => {book: updatedBook}  */
    describe("PUT /books/:isbn", function () {
        test("successfully updates book info", async function () {
            // execute the put request, then /get, check that the books info matches updated info
            const resp = await request(app)
                .put(`/books/${isbn}`)
                .send({
                    isbn: "0691161518",
                    amazon_url: "http://a.co/eobPtX2",
                    author: "Test Update",
                    language: "english",
                    pages: 264,
                    publisher: "Test Update",
                    title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
                    year: 2017
                }); 
            
            expect(response.body).toEqual({
                book: {
                    isbn: "0691161518",
                    amazon_url: "http://a.co/eobPtX2",
                    author: "Test Update",
                    language: "english",
                    pages: 264,
                    publisher: "Test Update",
                    title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
                    year: 2017
                }
            });          
        });

        test("throws error if user is trying to update book that does not exist", async function () {
            // check error msg: { message: `There is no book with an isbn '${isbn}`, 
            // check error status: 404 }
            const resp = await request(app)
                .put(`/books/123`)
                .send({
                    isbn: "123",
                    amazon_url: "http://a.co/eobPtX2",
                    author: "Matthew Lane",
                    language: "english",
                    pages: 264,
                    publisher: "Princeton University Press",
                    title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
                    year: 2017
                });
            expect(response.statusCode).toEqual(404);
            expect(response.body.error).toEqual({ "message": `There is no book with an isbn '123`, "status": 404 });     

        });

        // test("throws error if user provides invalid data", async function () {
        //     // check for error messages
        //     const resp = await request(app)
        //         .put(`/books/${isbn}`)
        //         .send({
        //             isbn: "0691161518",
        //             amazon_url: "WRONG",
        //             author: "Matthew Lane",
        //             language: "english",
        //             pages: 264,
        //             title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
        //             year: 2017
        //         }); 
            
        //         expect(response.statusCode).toEqual(404);
        //         expect(response.body.error).toEqual({ "message": `There is no book with an isbn '123`, "status": 404 });   
        // });
    });

    /** DELETE /[isbn]   => {message: "Book deleted"} */
    // describe("DELETE /books/:isbn", function () {
    //     test("sucessfully deletes book", async function () {
    //         // check for success message: { message: "Book deleted" }
    //         // maybe - after deleting, execute a get on the isbn & check that results.rows.length === 0
    //     });

    //     test("throws error if user is trying to delete a book that does not exist", async function () {
    //         // check error msg: { message: `There is no book with an isbn '${isbn}`, 
    //         // check error status: 404 }
    //     });
    // });


    afterAll(async function () {
        await db.end();
    });
});