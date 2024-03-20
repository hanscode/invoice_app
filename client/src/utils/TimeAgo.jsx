import propTypes from 'prop-types';

function formatTimeAgo(date) {
    const now = new Date();
    const time = Math.abs(now - date);
    const days = Math.floor(time / (1000 * 60 * 60 * 24));
    if (days === 0) {
      const hours = Math.floor(time / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(time / (1000 * 60));
        return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
      }
      return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    } else if (days === 1) {
      return '1 day ago';
    } else if (days < 30) {
      return `${days} days ago`;
    } else if (days < 365) {
      const months = Math.floor(days / 30);
      return months === 1 ? '1 month ago' : `${months} months ago`;
    } else {
      const years = Math.floor(days / 365);
      return years === 1 ? '1 year ago' : `${years} years ago`;
    }
  }

const TimeAgo = ({ date }) => {
    const formattedDate = formatTimeAgo(date);
  return (
    <span>{formattedDate}</span>
  )
}

export default TimeAgo

// set ppTypes for TimeAgo for the date prop
TimeAgo.propTypes = {
    date: propTypes.instanceOf(Date).isRequired,
  };