/*
Toolbox Aid
David Quesenberry
03/22/2026
PlaylistManager.js
*/
export default class PlaylistManager {
  constructor(mediaTracks) {
    this.mediaTracks = mediaTracks;
    this.playlists = new Map();
  }

  registerPlaylist(id, tracks = []) {
    this.playlists.set(id, {
      id,
      tracks: [...tracks],
      index: 0,
    });
    return this.getState(id);
  }

  play(id) {
    const playlist = this.playlists.get(id);
    if (!playlist || playlist.tracks.length === 0) {
      return false;
    }

    return this.mediaTracks.play(playlist.tracks[playlist.index]);
  }

  pause(id) {
    const playlist = this.playlists.get(id);
    if (!playlist || playlist.tracks.length === 0) {
      return false;
    }

    return this.mediaTracks.pause(playlist.tracks[playlist.index]);
  }

  stop(id) {
    const playlist = this.playlists.get(id);
    if (!playlist || playlist.tracks.length === 0) {
      return false;
    }

    return this.mediaTracks.stop(playlist.tracks[playlist.index]);
  }

  next(id) {
    const playlist = this.playlists.get(id);
    if (!playlist || playlist.tracks.length === 0) {
      return false;
    }

    playlist.index = (playlist.index + 1) % playlist.tracks.length;
    this.mediaTracks.stop(playlist.tracks[(playlist.index + playlist.tracks.length - 1) % playlist.tracks.length]);
    return this.play(id);
  }

  previous(id) {
    const playlist = this.playlists.get(id);
    if (!playlist || playlist.tracks.length === 0) {
      return false;
    }

    playlist.index = (playlist.index + playlist.tracks.length - 1) % playlist.tracks.length;
    return this.play(id);
  }

  getState(id) {
    const playlist = this.playlists.get(id);
    if (!playlist) {
      return null;
    }

    return {
      id,
      tracks: [...playlist.tracks],
      index: playlist.index,
      currentTrackId: playlist.tracks[playlist.index] ?? null,
    };
  }
}
