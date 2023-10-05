const express = require('express');
const axios = require('axios');
const lodash = require('lodash');

const app = express();
const port = 3000;

app.use('/api/blog-search', (req, res, next) => {
    const query = req.query.query;

    axios.get('https://intent-kit-16.hasura.app/api/rest/blogs', {
        header: {
            'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6'
        }
    })
    .then(response => {
        const filteredblogs = response.data.filter(blog =>
            blog.title.toLowerCase().includes(query.toLowerCase())
        );

        req.filteredblogs = filteredblogs;
        next();
    })
    .catch(error => {
        // Handle errors during data retrieval or search process
        console.error('Error fetching or filtering the blog data:', error);
        res.status(500).json({ error: 'Server Error' });
    });
});

app.use('/api/blog-stats', (req, res, next) => { //middleware created to curl request to fetch our data
    axios.get('https://intent-kit-16.hasura.app/api/rest/blogs', { //axios is used instead of fetch because axios performs automatic transforms of JSON data
        header: {
            'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6'
        }
    })
    .then(response => {
        const blogs = response.data;
        const totalNoOfBlogs = blogs.length;
        const BlogWithlongestTitle = lodash.maxBy(blogs, 'title.length');
        const blogsWithPrivacyWord = lodash.filter(blogs, blog => lodash.includes(blog.title.toLowerCase(), 'privacy'));
        const uniqueBlogTitles = lodash.uniqBy(blogs, 'title');

        const stats = {
            totalNoOfBlogs: totalNoOfBlogs,
            BlogWithlongestTitle: BlogWithlongestTitle.title,
            blogsWithPrivacyWord: blogsWithPrivacyWord.length,
            uniqueBlogTitles: uniqueBlogTitles.map(blog => blog.title)
        };

        req.blogStats = stats;
        next();
    })
    .catch(error => {
        // To Handle errors during data retrieval / analysis 
        console.error('Error fetching or analyzing the blog data:', error);
        res.status(500).json({ error: 'Server Error' });
    });
});

app.get('/api/blog-search', (req, res) => {
    res.json(req.filteredblogs); // to respond to the client in json format used .json instead of .send
});

app.get('/api/blog-stats', (req, res) => {
    res.json(req.blogStats); // to respond to the client in json format used .json instead of .send
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
