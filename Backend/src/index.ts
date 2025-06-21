import app from './app';

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
);

export default server; // Exporting server for test teardown
