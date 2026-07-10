import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Carousel from 'react-bootstrap/Carousel';

function ShowcaseDetail() {
  const { id } = useParams();
  const [showcase, setShowcase] = useState(null);

  useEffect(() => {
    axios
      .get(`/showcase/get/${id}`)
      .then(({ data }) => setShowcase(data))
      .catch((err) => console.error('Could not GET showcase: ', err));
  }, [id]);

  if (!showcase) {
    return (
      <Container>
        <p>Loading showcase...</p>
      </Container>
    );
  }

  return (
    <Container>
      <Row>
        <h1>{showcase.title}</h1>
        <p>{`Curated by ${showcase.curatorName}`}</p>
        <p>{showcase.message}</p>
      </Row>
      <Row>
        <Carousel>
          {showcase.artPieces.map((art) => (
            <Carousel.Item key={art.imageId}>
              <img
                className="d-block w-100"
                src={art.imageUrl}
                alt={art.title}
                style={{ maxHeight: '500px', objectFit: 'contain' }}
              />
              <Carousel.Caption>
                <h5>{art.title}</h5>
                <p>{art.artist}</p>
              </Carousel.Caption>
            </Carousel.Item>
          ))}
        </Carousel>
      </Row>
      {showcase.musicUrl && (
        <Row className="mt-3">
          <audio controls src={showcase.musicUrl}>
            <track kind="captions" />
          </audio>
        </Row>
      )}
    </Container>
  );
}

export default ShowcaseDetail;
