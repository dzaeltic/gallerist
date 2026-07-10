import React, { useState, useEffect } from 'react';
import axios from 'axios';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import Card from 'react-bootstrap/Card';

const TRACKS = [
  { label: 'amb062', value: '/audio/amb062.m4a' },
  { label: 'amb064_08vx', value: '/audio/amb064_08vx.m4a' },
  { label: 'amb064_21', value: '/audio/amb064_21.m4a' },
  { label: 'dyingRecursively-yes', value: '/audio/dyingRecursively-yes.m4a' },
  { label: 'dyingRecursively', value: '/audio/dyingRecursively.m4a' },
  {
    label: 'forSleepersAndInsomniacs',
    value: '/audio/forSleepersAndInsomniacs.m4a',
  },
  { label: 'leaking', value: '/audio/leaking.m4a' },
  { label: 'noEndpoint', value: '/audio/noEndpoint.m4a' },
];

function ShowcaseSetup() {
  const [myShowcases, setMyShowcases] = useState([]);
  const [myArt, setMyArt] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [musicUrl, setMusicUrl] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [auctionDate, setAuctionDate] = useState('');
  const [artPieces, setArtPieces] = useState([]);

  function getMine() {
    axios
      .get('/showcase/mine')
      .then(({ data }) => setMyShowcases(data))
      .catch((err) => console.error('Could not GET my showcases: ', err));
  }

  useEffect(() => {
    getMine();
    axios
      .get('/db/userArt/')
      .then(({ data }) => setMyArt(data))
      .catch((err) => console.error('Could not GET my art: ', err));
  }, []);

  function resetForm() {
    setEditingId(null);
    setTitle('');
    setMessage('');
    setMusicUrl('');
    setStartDate('');
    setEndDate('');
    setAuctionDate('');
    setArtPieces([]);
  }

  function loadForEdit(showcase) {
    setEditingId(showcase._id);
    setTitle(showcase.title || '');
    setMessage(showcase.message || '');
    setMusicUrl(showcase.musicUrl || '');
    setStartDate(showcase.startDate ? showcase.startDate.slice(0, 10) : '');
    setEndDate(showcase.endDate ? showcase.endDate.slice(0, 10) : '');
    setAuctionDate(
      showcase.auctionDate ? showcase.auctionDate.slice(0, 10) : '',
    );
    setArtPieces(showcase.artPieces || []);
  }

  function toggleArt(artId) {
    setArtPieces((prev) =>
      prev.includes(artId)
        ? prev.filter((id) => id !== artId)
        : [...prev, artId],
    );
  }

  function handleSubmit(event) {
    event.preventDefault();
    const payload = {
      title,
      message,
      musicUrl,
      startDate,
      endDate,
      auctionDate,
      artPieces,
    };

    const request = editingId
      ? axios.patch(`/showcase/update/${editingId}`, payload)
      : axios.post('/showcase/create', payload);

    request
      .then(() => {
        resetForm();
        getMine();
      })
      .catch((err) => console.error('Could not save showcase: ', err));
  }

  function handleDelete(id) {
    axios
      .delete(`/showcase/delete/${id}`)
      .then(() => {
        if (editingId === id) resetForm();
        getMine();
      })
      .catch((err) => console.error('Could not DELETE showcase: ', err));
  }

  return (
    <Container>
      <Row className="mb-3">
        <Col>
          <h1>
            <strong>Showcase Studio</strong>
          </h1>
          <p className="text-muted mb-0">
            Manage your existing showcases or curate a new one.
          </p>
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Header as="h5">My Showcases</Card.Header>
        <ListGroup variant="flush">
          {myShowcases.length ? (
            myShowcases.map((showcase) => (
              <ListGroup.Item key={showcase._id}>
                <Row className="align-items-center">
                  <Col sm={8}>{showcase.title}</Col>
                  <Col sm={2}>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => loadForEdit(showcase)}
                    >
                      Edit
                    </Button>
                  </Col>
                  <Col sm={2}>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(showcase._id)}
                    >
                      Delete
                    </Button>
                  </Col>
                </Row>
              </ListGroup.Item>
            ))
          ) : (
            <ListGroup.Item className="text-muted">
              You have no showcases yet. Create your first one below!
            </ListGroup.Item>
          )}
        </ListGroup>
      </Card>

      <Card>
        <Card.Header as="h5">
          {editingId ? 'Edit Showcase' : 'Create Showcase'}
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Message</Form.Label>
              <Form.Control
                as="textarea"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Music</Form.Label>
              <Form.Select
                value={musicUrl}
                onChange={(e) => setMusicUrl(e.target.value)}
              >
                <option value="">No Music</option>
                {TRACKS.map((track) => (
                  <option key={track.value} value={track.value}>
                    {track.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Auction Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={auctionDate}
                    onChange={(e) => setAuctionDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Choose Art From Your Gallery</Form.Label>
              {myArt.map((art) => (
                <Form.Check
                  key={art._id}
                  type="checkbox"
                  label={`${art.title} - ${art.artist}`}
                  checked={artPieces.includes(art._id)}
                  onChange={() => toggleArt(art._id)}
                />
              ))}
            </Form.Group>

            <Button variant="primary" type="submit">
              {editingId ? 'Save Changes' : 'Create Showcase'}
            </Button>
            {editingId && (
              <Button variant="secondary" className="ms-2" onClick={resetForm}>
                Cancel Edit
              </Button>
            )}
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ShowcaseSetup;
