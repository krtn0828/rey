import React from 'react';
import { View, Text, FlatList } from 'react-native-web';
import youtubeHelper from 'youtube-search';
import { ScaleLoader } from 'react-spinners';

import {
  YOUTUBE_API_KEY,
  YOUTUBE_SEARCH_RESULTS_MAX,
  SEARCH_MIN_LETTERS,
  CONST_INVALID_URL,
} from './../../config/Constants';
import './../../styles/input.css';
import SearchResultItem from '../listItems/SearchResultItem';
import WhatAShame from '../WhatAShame';
import { getYoutubeId } from '../../utils/utils';

const styles = {
  rootContainer: {
    width: '100%',
    height: '100%',
  },
  searchBoxContainer: {
    marginTop: 30,
  },
  searchResultsContainer: {
    marginTop: 20,
  },
  centerContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
};

class SearchTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      data: [],
      empty: false,
      checked: false,
    };
    // this._searchYoutube('telugu songs', 20);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange = event => {
    const searchTerm = event.target.value;

    if (searchTerm === '') {
      this.setState({
        data: [],
        isLoading: false,
        empty: false,
      });
    }

    if (searchTerm && searchTerm.length > SEARCH_MIN_LETTERS - 1) {
      this.setState(
        {
          isLoading: true,
        },
        () => {
          if (getYoutubeId(searchTerm) === CONST_INVALID_URL) {
            this._searchYoutube(searchTerm, YOUTUBE_SEARCH_RESULTS_MAX);
          } else {
            // enterted search term is youtube link and so render top 1 result
            this._searchYoutube(searchTerm, 1);
          }
        }
      );
    } else {
      this.setState({ data: [], isLoading: false });
    }
  };

  _cleanSearchResults = results => {
    const filteredResults = [];
    results.forEach(element => {
      // currently no support for youtube playlists, so filter them out
      if (element.kind === 'youtube#video') filteredResults.push(element);
    });
    return filteredResults;
  };

  _searchYoutube = (searchTerm, limit) => {
    const opts = {
      maxResults: limit,
      key: YOUTUBE_API_KEY,
    };
    youtubeHelper(searchTerm, opts, (err, results) => {
      if (err) return console.log(err);

      if (results.length === 0) {
        this.setState({ empty: true, isLoading: false });
      } else {
        const cleanData = this._cleanSearchResults(results);
        this.setState({
          data: cleanData,
          empty: false,
          isLoading: false,
        });
      }
    });
  };

  // _renderData = songs => {
  //   const songsList = songs.map(s => (
  //     <SearchResultItem thumbnailUrl={s.thumbnails.medium.url} name={s.title} videoUrl={s.link} key={s.id} />
  //   ));
  //   this.setState({ empty: false, data: songsList, isLoading: false });
  // };

  render() {
    return (
      <View style={styles.rootContainer}>
        <View style={styles.searchBoxContainer}>
          <input
            type="text"
            placeholder="start typing to search or paste a link from from youtube"
            onChange={this.handleChange}
          />
        </View>
        <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={this.state.checked}
            onChange={() => this.setState({ checked: !this.state.checked })}
          />
          <Text
            className="font"
            style={{ marginLeft: 10, cursor: 'pointer' }}
            onClick={() => this.setState({ checked: !this.state.checked })}
          >
            Show Images
          </Text>
        </View>

        <FlatList
          style={{ marginTop: 15 }}
          keyExtractor={item => item.id}
          data={this.state.data}
          renderItem={({ item }) => (
            <SearchResultItem
              key={item.id}
              thumbnailUrl={item.thumbnails.medium.url}
              name={item.title}
              videoUrl={item.id}
              showImage={this.state.checked}
            /> // item.link uses too much data
          )}
        />

        {this.state.isLoading && (
          <View style={styles.centerContainer}>
            <ScaleLoader color="#8bb955" loading />
          </View>
        )}

        {this.state.empty && (
          <View style={styles.centerContainer}>
            <View>
              <Text className="font" style={{ fontSize: 24, color: '#8bb955' }}>
                No Results
              </Text>
            </View>
            <WhatAShame />
          </View>
        )}
      </View>
    );
  }
}

export default SearchTab;
